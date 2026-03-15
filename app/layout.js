import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import CookieConsent from '@/components/CookieConsent'
import { ToastProvider } from '@/components/Toast'
import GoogleAnalytics from '@/components/GoogleAnalytics'

export const metadata = {
  title: 'Event Nest - The Smarter Way to Plan Events',
  description: 'Browse top-rated caterers, photographers, DJs, florists and more. Plan your dream event with confidence.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/logo.png',
  },
  manifest: '/manifest.json',
  themeColor: '#7c3aed',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Event Nest',
  },
  openGraph: {
    title: 'Event Nest - The Smarter Way to Plan Events',
    description: 'Browse top-rated caterers, photographers, DJs, florists and more. Plan your dream event with confidence.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Event Nest - The Smarter Way to Plan Events',
    description: 'Browse top-rated caterers, photographers, DJs, florists and more. Plan your dream event with confidence.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider><ToastProvider>{children}</ToastProvider></AuthProvider>
        <CookieConsent />
        <GoogleAnalytics />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
