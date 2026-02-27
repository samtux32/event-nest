'use client'

import { useAuth } from './AuthProvider'
import VendorHeader from './VendorHeader'
import CustomerHeader from './CustomerHeader'
import PublicHeader from './PublicHeader'

export default function AppHeader() {
  const { user, isVendor, activeMode } = useAuth()

  // Not logged in → show public header
  if (!user) {
    return <PublicHeader />
  }

  // Vendor in customer mode → show customer header
  if (isVendor && activeMode === 'customer') {
    return <CustomerHeader />
  }

  // Vendor in vendor mode → show vendor header
  if (isVendor) {
    return <VendorHeader />
  }

  // Customer → show customer header
  return <CustomerHeader />
}
