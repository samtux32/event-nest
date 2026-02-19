import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'

export const metadata = {
  title: 'Event Nest - Find Perfect Event Vendors',
  description: 'Browse top-rated caterers, photographers, DJs, florists and more. Plan your dream event with confidence.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
