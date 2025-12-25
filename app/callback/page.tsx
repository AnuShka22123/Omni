'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if payment was successful (Razorpay adds payment_id or status in URL)
    const paymentId = searchParams.get('payment_id') || searchParams.get('razorpay_payment_id')
    const status = searchParams.get('status')
    
    // Retrieve decision data from sessionStorage
    const type = sessionStorage.getItem('decisionType') || 'yes-no'
    const input = sessionStorage.getItem('decisionInput') || ''

    // Clear sessionStorage
    sessionStorage.removeItem('decisionType')
    sessionStorage.removeItem('decisionInput')

    // If payment successful, go to loading screen
    if (paymentId || status === 'success') {
      router.push(`/loading?type=${type}&input=${encodeURIComponent(input)}&payment_id=${paymentId || 'completed'}`)
    } else {
      // Payment failed or cancelled, go back to select
      router.push('/select')
    }
  }, [router, searchParams])

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-gray-400 mb-4">Processing payment...</p>
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </main>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </main>
    }>
      <CallbackContent />
    </Suspense>
  )
}

