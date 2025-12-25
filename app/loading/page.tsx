'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const messages = [
  'Reading your situation…',
  'Removing bias…',
  'Delivering verdict…',
]

export default function LoadingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'yes-no'
  const input = searchParams.get('input') || ''
  const paymentId = searchParams.get('payment_id') || ''

  const [currentMessage, setCurrentMessage] = useState(0)

  useEffect(() => {
    if (currentMessage < messages.length - 1) {
      const timer = setTimeout(() => {
        setCurrentMessage(currentMessage + 1)
      }, 1200)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        router.push(`/verdict?type=${type}&input=${encodeURIComponent(input)}&payment_id=${paymentId}`)
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [currentMessage, router, type, input, paymentId])

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-xl text-gray-300 animate-pulse">
          {messages[currentMessage]}
        </p>
      </div>
    </main>
  )
}

