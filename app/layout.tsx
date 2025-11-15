import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GazaPay - Voice Banking Assistant',
  description: 'Secure voice-powered banking assistant with hold-to-talk interface',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#701a75',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}

