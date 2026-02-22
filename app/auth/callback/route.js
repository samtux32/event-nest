import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const raw = searchParams.get('redirectTo') || '/'
  const redirectTo = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/'

  if (code) {
    const cookieStore = await cookies()
    const pendingCookies = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            // Collect cookies instead of setting them now — we need to attach
            // them to the redirect response, not the current (discarded) response
            pendingCookies.push(...cookiesToSet)
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      const destination = (user && !user.user_metadata?.role)
        ? `${origin}/register?oauth=true`
        : `${origin}${redirectTo}`

      const response = NextResponse.redirect(destination)

      // Attach the session cookies to the redirect so the browser keeps the session
      pendingCookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })

      return response
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
