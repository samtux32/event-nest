import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { newsletterSchema } from '@/lib/validation/marketingSchemas'
import { validateBody } from '@/lib/validation/helpers'
import { rateLimit, limiters } from '@/lib/rate-limit'

export async function POST(request) {
  try {
    const limited = await rateLimit(request, limiters.contact)
    if (limited) return limited

    const { data, response: validationError } = await validateBody(request, newsletterSchema)
    if (validationError) return validationError

    const { email } = data

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ success: true, message: 'Already subscribed' })
    }

    await prisma.newsletterSubscriber.create({ data: { email } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Newsletter error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
