import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email'
import { registerSchema } from '@/lib/validation/authSchemas'
import { validateBody } from '@/lib/validation/helpers'
import { rateLimit, limiters } from '@/lib/rate-limit'

export async function POST(request) {
  const limited = await rateLimit(request, limiters.auth)
  if (limited) return limited

  const { data: body, response: validationError } = await validateBody(request, registerSchema)
  if (validationError) return validationError

  const { role, fullName, businessName, userId, userEmail, ref: referralCode } = body
  const categories = body.categories || (body.category ? [body.category] : [])

  // Try to get user from session first
  let id = null
  let email = null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    id = user.id
    email = user.email
  } else if (userId && userEmail) {
    id = userId
    email = userEmail
  } else {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
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
      let referredByVendorId = null;
      if (referralCode) {
        const referrer = await prisma.vendorProfile.findUnique({
          where: { referralCode },
          select: { id: true },
        });
        if (referrer) referredByVendorId = referrer.id;
      }

      await prisma.user.create({
        data: {
          id,
          email,
          role: 'vendor',
          vendorProfile: {
            create: {
              businessName: businessName || 'My Business',
              categories: categories.length > 0 ? categories : ['Other'],
              ...(referredByVendorId ? { referredByVendorId } : {}),
            },
          },
        },
      })
    }

    sendWelcomeEmail({
      recipientEmail: email,
      recipientName: role === 'customer' ? (fullName || email.split('@')[0]) : (businessName || 'there'),
      isVendor: role === 'vendor',
    }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}
