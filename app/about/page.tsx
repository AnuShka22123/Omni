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
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className={`w-full max-w-2xl space-y-12 transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-light text-balance">
            About Us
          </h1>
          <p className="text-lg text-gray-400 text-balance">
            When indecision becomes paralysis, we provide clarity.
          </p>
        </div>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px bg-dark-border flex-1"></div>
              <h2 className="text-xl font-light text-white tracking-wide">What We Do</h2>
              <div className="h-px bg-dark-border flex-1"></div>
            </div>
            <p className="pl-2">
              We help you make small, personal decisions when you're stuck. 
              Whether it's a yes or no, choosing between options, or deciding 
              when to act—we provide a clear, confident verdict for ₹5.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px bg-dark-border flex-1"></div>
              <h2 className="text-xl font-light text-white tracking-wide">How It Works</h2>
              <div className="h-px bg-dark-border flex-1"></div>
            </div>
            <div className="space-y-3 pl-2">
              <p>
                You describe your situation. You pay ₹5. We give you a verdict. 
                The decision is made. You move forward.
              </p>
              <p className="text-gray-400 text-sm italic">
                No accounts. No data stored. Just a simple, honest answer when you need it.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px bg-dark-border flex-1"></div>
              <h2 className="text-xl font-light text-white tracking-wide">Why We Exist</h2>
              <div className="h-px bg-dark-border flex-1"></div>
            </div>
            <p className="pl-2">
              Sometimes the hardest part of a decision is making it. We remove 
              the paralysis of choice by giving you a clear answer. The small 
              payment ensures you value the outcome and commit to it.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px bg-dark-border flex-1"></div>
              <h2 className="text-xl font-light text-white tracking-wide">Payment & Privacy</h2>
              <div className="h-px bg-dark-border flex-1"></div>
            </div>
            <p className="pl-2">
              We use Razorpay for secure, UPI-friendly payments. We don't store 
              your personal information or decision history. Each verdict is 
              independent and private.
            </p>
          </section>
        </div>

        <div className="pt-8 border-t border-dark-border">
          <button
            onClick={() => router.push('/')}
            className="w-full py-4 px-8 bg-white text-black font-medium text-lg rounded-sm hover:bg-gray-100 transition-colors"
          >
            Get a Verdict
          </button>
        </div>
      </div>
    </main>
  )
}

