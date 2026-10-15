import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'sprintern — Student × Startup Match',
  description:
    'AI-powered sprint matchmaking between top student builders and high-growth startups.',
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
