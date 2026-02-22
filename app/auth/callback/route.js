import { NextResponse } from 'next/server'

export async function GET(request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const redirectTo = url.searchParams.get('redirectTo') || '/'

  // Pass the code to the client-side handler which does the exchange
  // in the browser where the PKCE verifier and session storage live
  const destination = new URL('/auth/complete', url.origin)
  if (code) destination.searchParams.set('code', code)
  destination.searchParams.set('redirectTo', redirectTo)

  return NextResponse.redirect(destination.toString())
}
