import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const basePath = '/SAC'

export const metadata: Metadata = {
  title: 'Weather App - Check Weather Anywhere',
  description: 'A modern weather application built with React and weatherapi.com. Check current weather, 5-day forecasts, and more for any location.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: `${basePath}/icon-light-32x32.png`,
        media: '(prefers-color-scheme: light)',
      },
      {
        url: `${basePath}/icon-dark-32x32.png`,
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: `${basePath}/icon.svg`,
        type: 'image/svg+xml',
      },
    ],
    apple: `${basePath}/apple-icon.png`,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const shouldEnableAnalytics =
    process.env.NODE_ENV === 'production' && process.env.VERCEL === '1'

  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        {children}
        {shouldEnableAnalytics && <Analytics />}
      </body>
    </html>
  )
}
