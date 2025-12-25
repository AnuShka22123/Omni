'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

function PaymentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'yes-no'
  const input = searchParams.get('input') || ''

  useEffect(() => {
    // Store the decision data in sessionStorage before redirecting
    sessionStorage.setItem('decisionType', type)
    sessionStorage.setItem('decisionInput', input)
    
    // Get the callback URL (your deployed URL + /callback)
    const callbackUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/callback`
      : '/callback'
    
    // Redirect to Razorpay payment link with callback
    // Note: You'll need to configure the redirect URL in Razorpay dashboard
    // For now, using the payment link - configure redirect in Razorpay settings
    window.location.href = `https://razorpay.me/@omniweb`
  }, [type, input])

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-gray-400 mb-4">Redirecting to payment...</p>
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </main>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </main>
    }>
      <PaymentForm />
    </Suspense>
  )
}

