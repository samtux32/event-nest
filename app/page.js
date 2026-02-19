'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import VendorDashboard from '@/components/VendorDashboard'
import LandingPage from '@/components/LandingPage'
import CustomerMarketplace from '@/components/CustomerMarketplace'

export default function Home() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  if (!user) {
    return <LandingPage />
  }

  if (profile?.role === 'admin') {
    router.replace('/admin')
    return null
  }

  if (profile?.role === 'customer') {
    return <CustomerMarketplace />
  }

  return <VendorDashboard />
}
