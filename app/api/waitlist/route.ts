import { NextRequest, NextResponse } from "next/server";
import { validateFingerprint } from "@/lib/fingerprint-validation";
import { Ratelimit } from "@unkey/ratelimit";

const fallback = (identifier: string) => ({
  success: false,
  limit: 0,
  reset: 0,
  remaining: 0,
});

const limiter = new Ratelimit({
  rootKey: process.env.UNKEY_ROOT_KEY!,
  duration: 3600000, // 1 hour
  limit: 3,
  namespace: "waitlist",
  timeout: {
    ms: 3000, // only wait 3s at most before returning the fallback
    fallback,
  },
  onError: (err, identifier) => {
    console.error(`${identifier} - ${err.message}`);
    return fallback(identifier);
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, fingerprintData } = body;

    // Validate required fields
    if (!email || !fingerprintData) {
      return NextResponse.json(
        {
          error: "Email and device fingerprint are required",
          success: false,
        },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: "Invalid email format",
          success: false,
        },
        { status: 400 },
      );
    }

    // Validate fingerprint data
    const validation = validateFingerprint(fingerprintData);
    if (!validation.isValid) {
      console.log("Invalid fingerprint:", validation.errors);
      return NextResponse.json(
        {
          error: "Invalid or suspicious device fingerprint",
          success: false,
          details: validation.errors, // Remove this in production
        },
        { status: 400 },
      );
    }

    // Check rate limit using Unkey with the validated fingerprint
    const { success, limit, remaining, reset } = await limiter.limit(
      fingerprintData.thumbmark,
    );

    if (!success) {
      const resetTime = new Date(Date.now() + reset);
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          success: false,
          rateLimited: true,
          resetTime: resetTime.toISOString(),
          remaining: remaining,
          limit: limit,
        },
        { status: 429 },
      );
    }

    // Simulate storing the email in a database
    // In a real application, you would save this to your database
    console.log("New waitlist signup:", {
      email,
      fingerprint: fingerprintData.thumbmark,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully added to waitlist!",
        remaining: remaining,
        limit: limit,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        success: false,
      },
      { status: 500 },
    );
  }
}
