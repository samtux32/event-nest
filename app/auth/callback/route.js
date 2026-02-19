import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const raw = searchParams.get('redirectTo') || '/'
  const redirectTo = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if user has a role set (returning user vs first-time OAuth)
      const { data: { user } } = await supabase.auth.getUser()
      if (user && !user.user_metadata?.role) {
        // First-time OAuth user - send to registration to pick a role
        return NextResponse.redirect(`${origin}/register?oauth=true`)
      }
      return NextResponse.redirect(`${origin}${redirectTo}`)
    }
  }

  // Auth code error - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
