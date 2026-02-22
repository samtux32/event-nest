'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthComplete() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function handleCallback() {
      const code = new URLSearchParams(window.location.search).get('code')
      const raw = new URLSearchParams(window.location.search).get('redirectTo') || '/'
      const redirectTo = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/'

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          const { data: { user } } = await supabase.auth.getUser()
          if (user && !user.user_metadata?.role) {
            router.replace('/register?oauth=true')
          } else if (user?.user_metadata?.role === 'customer') {
            router.replace('/marketplace')
          } else {
            router.replace(redirectTo)
          }
          return
        }
      }

      router.replace('/login?error=auth_callback_error')
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
    </div>
  )
}
