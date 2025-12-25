'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-4xl md:text-5xl font-light mb-4 text-balance">
          Stuck on a decision?
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-12 text-balance">
          Pay ₹5. Get a verdict. Move on.
        </p>
        <button
          onClick={() => router.push('/select')}
          className="w-full py-4 px-8 bg-white text-black font-medium text-lg rounded-sm hover:bg-gray-100 transition-colors"
        >
          Get a Verdict
        </button>
      </div>
    </main>
  )
}

