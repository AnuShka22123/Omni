'use client'

import { useRouter } from 'next/navigation'

export default function SelectPage() {
  const router = useRouter()

  const handleSelect = (type: string) => {
    router.push(`/input?type=${type}`)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.05),transparent_35%),radial-gradient(circle_at_75%_10%,rgba(99,102,241,0.07),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-15 mix-blend-soft-light bg-[radial-gradient(circle_at_50%_110%,rgba(255,255,255,0.08),transparent_50%)]" />
      <div className="relative w-full max-w-md">
        <div className="space-y-4">
          <button
            onClick={() => handleSelect('yes-no')}
            className="w-full py-6 px-8 bg-dark-surface border border-dark-border text-white font-medium text-xl rounded-sm hover:border-white transition-colors hover:-translate-y-0.5 transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            YES / NO
          </button>
          <button
            onClick={() => handleSelect('this-that')}
            className="w-full py-6 px-8 bg-dark-surface border border-dark-border text-white font-medium text-xl rounded-sm hover:border-white transition-colors hover:-translate-y-0.5 transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            THIS or THAT
          </button>
          <button
            onClick={() => handleSelect('now-later')}
            className="w-full py-6 px-8 bg-dark-surface border border-dark-border text-white font-medium text-xl rounded-sm hover:border-white transition-colors hover:-translate-y-0.5 transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            NOW or LATER
          </button>
        </div>
      </div>
    </main>
  )
}

