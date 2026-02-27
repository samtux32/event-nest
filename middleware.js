import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'

const publicPrefixes = ['/login', '/register', '/auth/callback', '/vendor-profile', '/api/auth', '/api/vendors', '/api/event-planner', '/booking', '/help', '/terms', '/privacy', '/inspiration', '/marketplace', '/plan-my-event']

// Routes only vendors can access
const vendorOnlyPrefixes = ['/profile-editor', '/messages', '/calendar', '/analytics', '/vendor-settings', '/qr-code', '/portfolio', '/promotions', '/vendor-faqs']

// Routes only customers can access
const customerOnlyPrefixes = ['/my-bookings', '/customer-messages', '/wishlist', '/customer-settings', '/compare', '/recently-viewed', '/my-plans', '/event-checklist']

// Routes only admins can access
const adminOnlyPrefixes = ['/admin']

function isPublicRoute(pathname) {
  if (pathname === '/') return true
  return publicPrefixes.some(prefix => pathname.startsWith(prefix))
}

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const { user, supabaseResponse } = await updateSession(request)
  const role = user?.user_metadata?.role

  // Allow public routes through
  if (isPublicRoute(pathname)) {
    // Logged-in user visiting login/register → redirect to their home
    if (user && (pathname === '/login' || pathname === '/register')) {
      const redirectTo = role === 'customer' ? '/marketplace' : role === 'admin' ? '/admin' : '/'
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
    // Admins visiting / → send to admin home (vendors and customers handled by page.js)
    if (user && pathname === '/') {
      if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
    }
    // Unauthenticated visitors hitting / → send to marketplace
    if (!user && pathname === '/') {
      return NextResponse.redirect(new URL('/marketplace', request.url))
    }
    return supabaseResponse
  }

  // Unauthenticated → send to login
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin-only routes
  if (adminOnlyPrefixes.some(p => pathname.startsWith(p))) {
    if (role !== 'admin') return NextResponse.redirect(new URL('/', request.url))
    return supabaseResponse
  }

  // Vendor-only routes
  if (vendorOnlyPrefixes.some(p => pathname.startsWith(p))) {
    if (role !== 'vendor') return NextResponse.redirect(new URL(role === 'customer' ? '/marketplace' : '/', request.url))
    return supabaseResponse
  }

  // Customer-only routes (vendors can also access in customer mode)
  if (customerOnlyPrefixes.some(p => pathname.startsWith(p))) {
    if (role !== 'customer' && role !== 'vendor') return NextResponse.redirect(new URL('/login', request.url))
    return supabaseResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
