import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sentiment.so - AI-Powered Market Sentiment Analysis',
  description: 'Real-time AI sentiment analysis for tech stocks and cryptocurrencies using Grok API',
  keywords: 'sentiment analysis, AI, stocks, crypto, market analysis, Grok API',
  authors: [{ name: 'Sentiment.so' }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <html lang="en">
      <head>
        {/* Google Analytics - only load in production with valid ID */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="bg-background-primary text-text-primary min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
} 