'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AboutPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_22%_20%,rgba(255,255,255,0.05),transparent_35%),radial-gradient(circle_at_80%_5%,rgba(99,102,241,0.07),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-15 mix-blend-soft-light bg-[radial-gradient(circle_at_50%_115%,rgba(255,255,255,0.08),transparent_50%)]" />
      <div className={`relative w-full max-w-2xl space-y-12 bg-dark-surface/60 border border-dark-border/70 backdrop-blur rounded-md p-6 md:p-10 shadow-[0_0_50px_-20px_rgba(99,102,241,0.6)] transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-light text-balance">
            System
          </h1>
          <p className="text-lg text-gray-400 text-balance">
            Verdict generation system.
          </p>
        </div>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px bg-dark-border flex-1"></div>
              <h2 className="text-xl font-light text-white tracking-wide">Function</h2>
              <div className="h-px bg-dark-border flex-1"></div>
            </div>
            <p className="pl-2">
              Input decision. Pay ₹5. Receive verdict. Outcome finalized.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px bg-dark-border flex-1"></div>
              <h2 className="text-xl font-light text-white tracking-wide">Process</h2>
              <div className="h-px bg-dark-border flex-1"></div>
            </div>
            <div className="space-y-3 pl-2">
              <p>
                State your situation. Payment processed. Verdict delivered. No further input required.
              </p>
              <p className="text-gray-400 text-sm">
                No accounts. No data stored. Each verdict is independent.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px bg-dark-border flex-1"></div>
              <h2 className="text-xl font-light text-white tracking-wide">Payment</h2>
              <div className="h-px bg-dark-border flex-1"></div>
            </div>
            <p className="pl-2">
              Razorpay processes payments. No personal information stored. Verdicts are private.
            </p>
          </section>
        </div>

        <div className="pt-8 border-t border-dark-border">
          <button
            onClick={() => router.push('/')}
            className="w-full py-4 px-8 bg-white text-black font-medium text-lg rounded-sm hover:bg-gray-100 transition-colors hover:-translate-y-0.5 transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Get a Verdict
          </button>
        </div>
      </div>
    </main>
  )
}

