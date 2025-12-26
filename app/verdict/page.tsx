'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

export const dynamic = 'force-dynamic'

async function getVerdict(type: string, input: string): Promise<{ verdict: string; justification: string }> {
  try {
    const response = await fetch('/api/generate-verdict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, input }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate verdict')
    }

    const data = await response.json()
    return {
      verdict: data.verdict,
      justification: data.justification,
    }
  } catch (error) {
    console.error('Error generating verdict:', error)
    // Fallback to simple deterministic verdict
    const fallbackVerdicts: Record<string, { verdicts: string[], justifications: string[] }> = {
      'yes-no': {
        verdicts: ['YES', 'NO'],
        justifications: [
          'The path forward is clear. Trust it.',
          'Not now. The timing isn\'t right.',
        ],
      },
      'this-that': {
        verdicts: ['THIS', 'THAT'],
        justifications: [
          'This aligns better with where you\'re heading.',
          'That option serves you more in the long run.',
        ],
      },
      'now-later': {
        verdicts: ['NOW', 'LATER'],
        justifications: [
          'Act now. Waiting won\'t improve this.',
          'Later. The timing needs to be right.',
        ],
      },
    }
    
    const templates = fallbackVerdicts[type] || fallbackVerdicts['yes-no']
    const hash = input.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const verdictIndex = hash % templates.verdicts.length
    const justificationIndex = hash % templates.justifications.length
    
    return {
      verdict: templates.verdicts[verdictIndex],
      justification: templates.justifications[justificationIndex],
    }
  }
}

function VerdictContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'yes-no'
  const input = searchParams.get('input') || ''
  
  const [verdictData, setVerdictData] = useState<{ verdict: string; justification: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (input) {
      setIsLoading(true)
      getVerdict(type, input)
        .then((data) => {
          setVerdictData(data)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error('Error loading verdict:', error)
          setIsLoading(false)
        })
    }
  }, [type, input])

  if (isLoading || !verdictData) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_22%_20%,rgba(255,255,255,0.05),transparent_35%),radial-gradient(circle_at_80%_5%,rgba(99,102,241,0.07),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-15 mix-blend-soft-light bg-[radial-gradient(circle_at_50%_115%,rgba(255,255,255,0.08),transparent_50%)]" />
        <div className="relative text-center">
          <p className="text-xl text-gray-300 animate-pulse">Delivering verdict...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_22%_20%,rgba(255,255,255,0.05),transparent_35%),radial-gradient(circle_at_80%_5%,rgba(99,102,241,0.07),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-15 mix-blend-soft-light bg-[radial-gradient(circle_at_50%_115%,rgba(255,255,255,0.08),transparent_50%)]" />
      <div className="relative w-full max-w-md space-y-8 bg-dark-surface/60 border border-dark-border/70 backdrop-blur rounded-md p-6 md:p-8 shadow-[0_0_50px_-20px_rgba(99,102,241,0.6)]">
        <div className="bg-dark-surface border border-dark-border p-8 rounded-sm text-center space-y-6 print:bg-white print:border-black print:text-black">
          <h2 className="text-5xl md:text-6xl font-bold print:text-black">
            {verdictData.verdict}
          </h2>
          <div className="text-left space-y-4">
            <p className="text-base md:text-lg text-gray-300 leading-relaxed print:text-black">
              {verdictData.justification}
            </p>
          </div>
          <p className="text-sm text-gray-500 print:text-gray-700">
            The decision is made. Move forward.
          </p>
        </div>

        <div className="space-y-3 print:hidden">
          <button
            onClick={() => router.push('/select')}
            className="w-full py-4 px-8 bg-white text-black font-medium text-lg rounded-sm hover:bg-gray-100 transition-colors hover:-translate-y-0.5 transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Another Decision – ₹5
          </button>
          <button
            onClick={() => window.print()}
            className="w-full py-4 px-8 bg-dark-surface border border-dark-border text-white font-medium text-lg rounded-sm hover:border-white transition-colors hover:-translate-y-0.5 transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Save Verdict
          </button>
        </div>
      </div>
    </main>
  )
}

export default function VerdictPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-400">Loading verdict...</p>
        </div>
      </main>
    }>
      <VerdictContent />
    </Suspense>
  )
}

