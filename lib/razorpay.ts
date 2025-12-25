// Server-only Razorpay wrapper
// This file uses dynamic imports to avoid build-time evaluation

export async function createRazorpayInstance() {
  // Check credentials first (before importing Razorpay)
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your environment variables.')
  }

  // Dynamic import - only happens at runtime, never during build
  const razorpayModule = await import('razorpay')
  const Razorpay = razorpayModule.default

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  })
}

