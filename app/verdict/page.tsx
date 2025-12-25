'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

export const dynamic = 'force-dynamic'

const VERDICT_TEMPLATES: Record<string, { verdicts: string[], justifications: string[] }> = {
  'yes-no': {
    verdicts: ['YES', 'NO'],
    justifications: [
      'The path forward is clear. Trust it.',
      'Not now. The timing isn\'t right.',
      'Your hesitation is the answer. Say no.',
      'The signs point to yes. Act on it.',
      'This isn\'t the right move. Decline.',
      'Yes. Stop overthinking and proceed.',
    ],
  },
  'this-that': {
    verdicts: ['THIS', 'THAT'],
    justifications: [
      'This aligns better with where you\'re heading.',
      'That option serves you more in the long run.',
      'This is the clearer choice. Choose it.',
      'That path offers more growth. Take it.',
      'This feels right. Trust that feeling.',
      'That option is the wiser move.',
    ],
  },
  'now-later': {
    verdicts: ['NOW', 'LATER'],
    justifications: [
      'Act now. Waiting won\'t improve this.',
      'Later. The timing needs to be right.',
      'Now is the moment. Don\'t delay.',
      'Wait. Better conditions are coming.',
      'Strike now. The opportunity is here.',
      'Later. You\'re not ready yet.',
    ],
  },
}

function getVerdict(type: string, input: string): { verdict: string; justification: string } {
  const templates = VERDICT_TEMPLATES[type] || VERDICT_TEMPLATES['yes-no']
  
  // Deterministic but pseudo-random based on input
  const hash = input.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const verdictIndex = hash % templates.verdicts.length
  const justificationIndex = hash % templates.justifications.length
  
  return {
    verdict: templates.verdicts[verdictIndex],
    justification: templates.justifications[justificationIndex],
  }
}

function VerdictContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'yes-no'
  const input = searchParams.get('input') || ''
  
  const [verdictData, setVerdictData] = useState<{ verdict: string; justification: string } | null>(null)

  useEffect(() => {
    if (input) {
      setVerdictData(getVerdict(type, input))
    }
  }, [type, input])

  if (!verdictData) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-400">Loading verdict...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="bg-dark-surface border border-dark-border p-8 rounded-sm text-center space-y-6 print:bg-white print:border-black print:text-black">
          <h2 className="text-5xl md:text-6xl font-bold print:text-black">
            {verdictData.verdict}
          </h2>
          <p className="text-lg text-gray-300 print:text-black">
            {verdictData.justification}
          </p>
          <p className="text-sm text-gray-500 print:text-gray-700">
            The decision is made. Move forward.
          </p>
        </div>

        <div className="space-y-3 print:hidden">
          <button
            onClick={() => router.push('/select')}
            className="w-full py-4 px-8 bg-white text-black font-medium text-lg rounded-sm hover:bg-gray-100 transition-colors"
          >
            Another Decision – ₹5
          </button>
          <button
            onClick={() => window.print()}
            className="w-full py-4 px-8 bg-dark-surface border border-dark-border text-white font-medium text-lg rounded-sm hover:border-white transition-colors"
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

