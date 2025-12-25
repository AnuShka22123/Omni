'use client'

import { useRouter } from 'next/navigation'

export default function SelectPage() {
  const router = useRouter()

  const handleSelect = (type: string) => {
    router.push(`/input?type=${type}`)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="space-y-4">
          <button
            onClick={() => handleSelect('yes-no')}
            className="w-full py-6 px-8 bg-dark-surface border border-dark-border text-white font-medium text-xl rounded-sm hover:border-white transition-colors"
          >
            YES / NO
          </button>
          <button
            onClick={() => handleSelect('this-that')}
            className="w-full py-6 px-8 bg-dark-surface border border-dark-border text-white font-medium text-xl rounded-sm hover:border-white transition-colors"
          >
            THIS or THAT
          </button>
          <button
            onClick={() => handleSelect('now-later')}
            className="w-full py-6 px-8 bg-dark-surface border border-dark-border text-white font-medium text-xl rounded-sm hover:border-white transition-colors"
          >
            NOW or LATER
          </button>
        </div>
      </div>
    </main>
  )
}

