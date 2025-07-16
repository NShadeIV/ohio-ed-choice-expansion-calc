import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EdChoice Expansion Calc',
  description: 'estimates EdChoice Expansion award based on AGI and other tax information',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
