import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const body = await request.json()
  const { role, fullName, businessName, category, userId, userEmail } = body

  if (!role || (role !== 'customer' && role !== 'vendor')) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // Try to get user from session first
  let id = null
  let email = null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    id = user.id
    email = user.email
  } else if (userId && userEmail) {
    // Fallback for when email confirmation is enabled -
    // the client passes the user info from the signUp response
    id = userId
    email = userEmail
  } else {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    // Check if user already exists in our DB
    const existing = await prisma.user.findUnique({ where: { id } })
    if (existing) {
      return NextResponse.json({ error: 'User already registered' }, { status: 409 })
    }

    if (role === 'customer') {
      await prisma.user.create({
        data: {
          id,
          email,
          role: 'customer',
          customerProfile: {
            create: {
              fullName: fullName || email.split('@')[0],
            },
          },
        },
      })
    } else {
      await prisma.user.create({
        data: {
          id,
          email,
          role: 'vendor',
          vendorProfile: {
            create: {
              businessName: businessName || 'My Business',
              category: category || 'Other',
            },
          },
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}
