'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const MAX_CHARS = 200

function InputForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'yes-no'
  
  const [input, setInput] = useState('')
  const [accepted, setAccepted] = useState(false)

  const handleSubmit = () => {
    if (input.trim().length > 0 && accepted) {
      router.push(`/payment?type=${type}&input=${encodeURIComponent(input)}`)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <p className="text-center text-gray-400 text-sm">
          You're about to receive a verdict. Don't use this lightly.
        </p>
        
        <div>
          <textarea
            value={input}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) {
                setInput(e.target.value)
              }
            }}
            placeholder="Describe your situation in one or two honest lines."
            className="w-full h-32 px-4 py-3 bg-dark-surface border border-dark-border text-white placeholder-gray-500 rounded-sm resize-none focus:outline-none focus:border-white transition-colors"
          />
          <p className="text-right text-xs text-gray-500 mt-1">
            {input.length}/{MAX_CHARS}
          </p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 w-4 h-4 accent-white cursor-pointer"
          />
          <span className="text-sm text-gray-300">
            I accept the outcome.
          </span>
        </label>

        <button
          onClick={handleSubmit}
          disabled={!accepted || input.trim().length === 0}
          className="w-full py-4 px-8 bg-white text-black font-medium text-lg rounded-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
        >
          Unlock Verdict – ₹5
        </button>
      </div>
    </main>
  )
}

export default function InputPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </main>
    }>
      <InputForm />
    </Suspense>
  )
}

