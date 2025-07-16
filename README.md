# Unkey Rate Limited Waitlist with Device Fingerprinting

A modern, secure waitlist application built with Next.js that uses **Unkey** for rate limiting and **thumbmark** for device fingerprinting. This prevents abuse while providing a smooth user experience.

## 🌟 Features

- **Device Fingerprinting**: Uses thumbmark to uniquely identify devices
- **Rate Limiting**: Unkey integration limits to 3 requests per hour per device

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Rate Limiting**: Unkey
- **Device Fingerprinting**: thumbmark.js
- **Language**: TypeScript
- **Icons**: Lucide React

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/perkinsjr/unkey-client-fingerprint.git
cd unkey-client-fingerprint
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your Unkey root key to `.env.local`:
```env
UNKEY_ROOT_KEY=your_unkey_root_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Environment Variables

Create a `.env.local` file with:

```env
UNKEY_ROOT_KEY=your_unkey_root_key_here
```

### Getting Your Unkey Root Key

1. Visit [Unkey.com](https://unkey.com) and create an account
2. Create a new workspace
3. Generate a root key with the following permissions:
   - `ratelimit.*` (for rate limiting functionality)
4. Add a namespace called `waitlist`.
5. Copy the key and add it to your `.env.local` file

## 🚀 How It Works

### Device Fingerprinting

The application uses thumbmark.js to generate a unique fingerprint for each device based on:
- Browser characteristics
- Screen resolution
- Timezone
- Hardware information
- And other device-specific attributes

### Rate Limiting

Unkey rate limiting is implemented with:
- **Namespace**: `waitlist`
- **Identifier**: Device fingerprint
- **Limit**: 3 requests per hour
- **Duration**: 3600000ms (1 hour)

### API Endpoint

The `/api/waitlist` endpoint:
1. Validates the email format
2. Validates the device fingerprint structure and authenticity
3. Checks rate limits using Unkey with the validated fingerprint
4. Returns appropriate responses based on validation and rate limit status

### Fingerprint Validation

The server performs comprehensive fingerprint validation to prevent abuse:

1. **Structure Validation**: Ensures the fingerprint contains all expected components (screen, canvas, WebGL, audio, fonts, etc.)
2. **Data Type Validation**: Verifies each component has the correct data type and reasonable values
3. **Hash Verification**: Validates that the provided hash matches the fingerprint components
4. **Realism Checks**: Detects obviously fake fingerprints by checking:
   - Common screen resolutions
   - Browser user agent format
   - Timezone format
   - Language code format
   - Presence of common fonts
5. **Tamper Detection**: Prevents manipulation by validating component relationships

## 📁 Project Structure

```
unkey-client-fingerprint/
├── app/
│   ├── api/
│   │   └── waitlist/
│   │       └── route.ts          # API endpoint for waitlist
│   ├── globals.css               # Global styles with CSS variables
│   ├── layout.tsx               # Root layout with Toaster
│   └── page.tsx                 # Main waitlist page
├── components/
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── toast.tsx
│       └── toaster.tsx
├── hooks/
│   └── use-toast.ts             # Toast hook
├── lib/
│   ├── utils.ts                 # Utility functions
│   └── fingerprint-validation.ts # Fingerprint validation logic
└── README.md
```

## 🔧 API Reference

### POST `/api/waitlist`

Submit an email to the waitlist.

**Request Body:**
```json
{
  "email": "user@example.com",
  "fingerprint": "device_fingerprint_hash"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Successfully added to waitlist!",
  "remaining": 2,
  "limit": 3
}
```

**Rate Limited Response (429):**
```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "success": false,
  "rateLimited": true,
  "resetTime": "2024-01-01T12:00:00.000Z",
  "remaining": 0,
  "limit": 3
}
```

## 🔒 Security Features

1. **Advanced Device Fingerprinting**: Uses thumbmark.js to create unique device signatures
2. **Multi-Layer Fingerprint Validation**:
   - **Structure Validation**: Ensures fingerprint contains expected components
   - **Hash Verification**: Validates fingerprint integrity using cryptographic hashing
   - **Realism Checks**: Detects obviously fake or manipulated fingerprints
   - **Component Analysis**: Validates screen resolution, user agent, fonts, etc.
3. **Rate Limiting**: Unkey-powered rate limiting prevents abuse
4. **Input Validation**: Server-side email validation
5. **Environment Variables**: Secure API key storage
6. **Tamper Detection**: Prevents users from sending fake fingerprints

## 🚦 Rate Limiting Details

- **Limit**: 3 requests per hour per device
- **Window**: 1 hour (3600000ms)
- **Identifier**: Device fingerprint
- **Namespace**: `waitlist`

When rate limited, users see:
- Clear error message
- Time until they can try again
- Current usage status

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
