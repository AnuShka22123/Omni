import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Get a Verdict',
  description: 'Pay ₹5. Get a verdict. Move on.',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

