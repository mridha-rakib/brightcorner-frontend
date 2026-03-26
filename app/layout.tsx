import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'BrightCorner',
  description: 'Silence is the ultimate luxury. Secure encrypted messaging with perfect forward secrecy and zero-knowledge architecture.',
  generator: 'AMAN',
  icons: {
    icon: [
      {
        url: '/logo2.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logo2.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/logo2.png',
        type: 'image/png',
      },
    ],
    apple: '/logo2.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
