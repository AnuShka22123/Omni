'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Script from 'next/script'

export const dynamic = 'force-dynamic'

declare global {
  interface Window {
    Razorpay: any
  }
}

function PaymentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'yes-no'
  const input = searchParams.get('input') || ''

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  const initializePayment = useCallback(async () => {
    if (!razorpayLoaded || typeof window === 'undefined' || !window.Razorpay) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Create order on server
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 500, // ₹5 in paise
          type,
          input,
        }),
      })

      const data = await response.json()

      if (!data.orderId) {
        throw new Error('Failed to create order')
      }

      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      if (!razorpayKeyId) {
        throw new Error('Razorpay key not configured')
      }

      const options = {
        key: razorpayKeyId,
        amount: 500,
        currency: 'INR',
        name: 'Get a Verdict', // Custom merchant name - won't show PAN name
        description: 'Decision verdict',
        order_id: data.orderId,
        handler: function (response: any) {
          // Payment successful
          router.push(`/loading?type=${type}&input=${encodeURIComponent(input)}&payment_id=${response.razorpay_payment_id}`)
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: function() {
            router.push('/select')
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
      setLoading(false)
    } catch (error: any) {
      console.error('Payment error:', error)
      setError(error.message || 'Payment failed. Please try again.')
      setLoading(false)
    }
  }, [razorpayLoaded, type, input, router])

  useEffect(() => {
    if (razorpayLoaded) {
      initializePayment()
    }
  }, [razorpayLoaded, initializePayment])

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => {
          setRazorpayLoaded(true)
        }}
        onError={() => {
          setError('Failed to load payment gateway')
          setLoading(false)
        }}
      />
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          {error ? (
            <div className="space-y-4">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => router.push('/select')}
                className="px-6 py-2 bg-dark-surface border border-dark-border rounded-sm hover:border-white transition-colors"
              >
                Go Back
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-400 mb-4">Preparing payment...</p>
              {loading && (
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              )}
            </>
          )}
        </div>
      </main>
    </>
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

