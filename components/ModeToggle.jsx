'use client'

import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'

export default function ModeToggle({ mobile = false }) {
  const { isVendor, activeMode, toggleMode } = useAuth()
  const router = useRouter()

  if (!isVendor) return null

  async function handleToggle() {
    await toggleMode()
    if (activeMode === 'vendor') {
      router.push('/marketplace')
    } else {
      router.push('/')
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={`${mobile ? 'flex sm:hidden' : 'hidden sm:flex'} items-center bg-gray-100 rounded-full p-0.5 text-xs font-medium`}
      title={`Switch to ${activeMode === 'vendor' ? 'customer' : 'vendor'} mode`}
    >
      <span
        className={`px-2.5 py-1 rounded-full transition-colors ${
          activeMode === 'vendor'
            ? 'bg-purple-600 text-white'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Vendor
      </span>
      <span
        className={`px-2.5 py-1 rounded-full transition-colors ${
          activeMode === 'customer'
            ? 'bg-purple-600 text-white'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Customer
      </span>
    </button>
  )
}
