'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  activeMode: null,
  toggleMode: async () => {},
  customerProfile: null,
  isVendor: false,
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [customerProfile, setCustomerProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeMode, setActiveMode] = useState(null)
  const supabase = createClient()

  const isVendor = profile?.role === 'vendor'

  async function fetchProfile() {
    try {
      const res = await fetch('/api/auth/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data.profile)
        if (data.customerProfile !== undefined) {
          setCustomerProfile(data.customerProfile)
        }
        // Init activeMode for vendors from localStorage
        if (data.profile?.role === 'vendor') {
          const saved = localStorage.getItem('eventNest_activeMode')
          setActiveMode(saved === 'customer' ? 'customer' : 'vendor')
        } else {
          setActiveMode(null)
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  async function toggleMode() {
    if (!isVendor) return
    const newMode = activeMode === 'vendor' ? 'customer' : 'vendor'

    // If switching to customer and no customer profile yet, create one
    if (newMode === 'customer' && !customerProfile) {
      try {
        const res = await fetch('/api/auth/ensure-customer-profile', { method: 'POST' })
        if (res.ok) {
          const data = await res.json()
          setCustomerProfile(data.customerProfile)
        }
      } catch (err) {
        console.error('Failed to ensure customer profile:', err)
        return
      }
    }

    setActiveMode(newMode)
    localStorage.setItem('eventNest_activeMode', newMode)
  }

  // Register push subscription after login
  async function registerPushSubscription() {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) return

      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      const { endpoint, keys } = subscription.toJSON()
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint, keys }),
      })
    } catch (err) {
      console.error('Push subscription failed:', err)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        fetchProfile()
        registerPushSubscription()
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        fetchProfile()
      } else {
        setProfile(null)
        setCustomerProfile(null)
        setActiveMode(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setCustomerProfile(null)
    setActiveMode(null)
    localStorage.removeItem('eventNest_activeMode')
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile: fetchProfile, activeMode, toggleMode, customerProfile, isVendor }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
