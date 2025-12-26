'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

const messages = [
  'Reading your situation…',
  'Removing bias…',
  'Delivering verdict…',
]

function LoadingContent() {
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
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.05),transparent_35%),radial-gradient(circle_at_75%_10%,rgba(99,102,241,0.07),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-15 mix-blend-soft-light bg-[radial-gradient(circle_at_50%_110%,rgba(255,255,255,0.08),transparent_50%)]" />
      <div className="relative text-center w-full max-w-md bg-dark-surface/60 border border-dark-border/70 backdrop-blur rounded-md px-6 py-10 shadow-[0_0_50px_-20px_rgba(99,102,241,0.6)]">
        <p className="text-xl text-gray-300 animate-pulse">
          {messages[currentMessage]}
        </p>
      </div>
    </main>
  )
}

export default function LoadingPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </main>
    }>
      <LoadingContent />
    </Suspense>
  )
}

