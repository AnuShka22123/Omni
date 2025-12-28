'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.07),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-soft-light bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.08),transparent_50%)]" />
      <div className="relative text-center max-w-md w-full space-y-6 bg-dark-surface/60 border border-dark-border/70 backdrop-blur rounded-md px-6 py-8 shadow-[0_0_50px_-20px_rgba(99,102,241,0.6)]">
        <h1 className="text-4xl md:text-5xl font-light mb-4 text-balance">
          Stuck on a decision?
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-12 text-balance">
          Pay ₹5. Get a verdict. Move on.
        </p>
        <button
          onClick={() => router.push('/select')}
          className="w-full py-4 px-8 bg-white text-black font-medium text-lg rounded-sm hover:bg-gray-100 transition-colors hover:-translate-y-0.5 transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Get a Verdict
        </button>
        <p className="mt-8">
          <button
            onClick={() => router.push('/about')}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            System
          </button>
        </p>
      </div>
    </main>
  )
}

