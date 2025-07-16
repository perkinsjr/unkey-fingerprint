"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Shield, Clock, CheckCircle } from "lucide-react";

// Import thumbmark for device fingerprinting
import { getThumbmark } from "@thumbmarkjs/thumbmarkjs";
import type { thumbmarkResponse } from "@/lib/fingerprint-validation";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fingerprintData, setFingerprintData] =
    useState<thumbmarkResponse | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining: number;
    limit: number;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Generate device fingerprint when component mounts
    const generateFingerprint = async () => {
      try {
        const result = await getThumbmark();
        setFingerprintData(result);
      } catch (error) {
        console.error("Error generating fingerprint:", error);
        toast({
          title: "Device Fingerprinting Error",
          description:
            "Unable to generate device fingerprint. Please refresh and try again.",
          variant: "destructive",
        });
      }
    };

    generateFingerprint();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fingerprintData) {
      toast({
        title: "Device Not Ready",
        description:
          "Please wait for device fingerprinting to complete and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          fingerprintData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setRateLimitInfo({
          remaining: data.remaining,
          limit: data.limit,
        });
        toast({
          title: "Success!",
          description: data.message,
        });
        setEmail("");
      } else {
        if (data.rateLimited) {
          const resetTime = new Date(data.resetTime);
          toast({
            title: "Rate Limited",
            description: `Too many requests. You can try again after ${resetTime.toLocaleTimeString()}`,
            variant: "destructive",
          });
          setRateLimitInfo({
            remaining: data.remaining,
            limit: data.limit,
          });
        } else {
          toast({
            title: "Error",
            description:
              data.error || "Something went wrong. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Network Error",
        description:
          "Unable to connect to the server. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Join the Waitlist
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Be the first to know when we launch our amazing new product!
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-lg">
          {isSuccess ? (
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                You're all set!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Thank you for joining our waitlist. We'll notify you as soon as
                we launch.
              </p>
              <Button
                onClick={() => {
                  setIsSuccess(false);
                  setRateLimitInfo(null);
                }}
                variant="outline"
                className="mt-4"
              >
                Add Another Email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                disabled={isLoading || !fingerprintData}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding to waitlist...
                  </>
                ) : (
                  "Join Waitlist"
                )}
              </Button>
            </form>
          )}

          {/* Rate Limit Info */}
          {rateLimitInfo && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                <Clock className="h-4 w-4" />
                <span>
                  {rateLimitInfo.remaining} of {rateLimitInfo.limit} requests
                  remaining this hour
                </span>
              </div>
            </div>
          )}

          {/* Security Info */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Shield className="h-4 w-4" />
              <span>Protected by device fingerprinting and rate limiting</span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Limited to 3 submissions per hour per device
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          <p>
            We respect your privacy. Your email will only be used to notify you
            about our launch.
          </p>
        </div>
      </div>
    </div>
  );
}
