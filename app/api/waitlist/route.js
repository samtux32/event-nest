import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { waitlistSchema } from '@/lib/validation/marketingSchemas'
import { validateBody } from '@/lib/validation/helpers'
import { rateLimit, limiters } from '@/lib/rate-limit'
import { sendWaitlistConfirmationEmail } from '@/lib/email'

export async function POST(request) {
  try {
    const limited = await rateLimit(request, limiters.contact)
    if (limited) return limited

    const { data, response: validationError } = await validateBody(request, waitlistSchema)
    if (validationError) return validationError

    const { email, userType, businessName, categories, name, location } = data

    // Check for existing signup — return success either way (no info leak)
    const existing = await prisma.waitlist.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ success: true, message: 'Already on the waitlist' })
    }

    await prisma.waitlist.create({
      data: {
        email,
        userType,
        ...(businessName && { businessName }),
        ...(categories && { categories }),
        ...(name && { name }),
        ...(location && { location }),
      },
    })

    // Fire-and-forget confirmation email
    sendWaitlistConfirmationEmail({ recipientEmail: email, userType }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Waitlist error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
