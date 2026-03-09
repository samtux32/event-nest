import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { vendorFaqSchema } from '@/lib/validation/vendorSchemas'
import { validateBody } from '@/lib/validation/helpers'

async function getVendorProfile(supabase) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const dbUser = await prisma.user.findFirst({
    where: { OR: [{ id: user.id }, { email: user.email }] },
    include: { vendorProfile: { select: { id: true } } },
  })
  return dbUser?.vendorProfile || null
}

// GET — list FAQs for the logged-in vendor
export async function GET() {
  try {
    const supabase = await createClient()
    const vp = await getVendorProfile(supabase)
    if (!vp) return NextResponse.json({ error: 'Vendor profile not found' }, { status: 403 })

    const faqs = await prisma.vendorFAQ.findMany({
      where: { vendorId: vp.id },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ faqs })
  } catch (err) {
    console.error('Vendor FAQs GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 })
  }
}

// POST — create a new FAQ
export async function POST(request) {
  try {
    const supabase = await createClient()
    const vp = await getVendorProfile(supabase)
    if (!vp) return NextResponse.json({ error: 'Vendor profile not found' }, { status: 403 })

    const { data: body, response: validationError } = await validateBody(request, vendorFaqSchema)
    if (validationError) return validationError

    const { question, answer } = body

    const maxSort = await prisma.vendorFAQ.aggregate({
      where: { vendorId: vp.id },
      _max: { sortOrder: true },
    })

    const faq = await prisma.vendorFAQ.create({
      data: {
        vendorId: vp.id,
        question: question.trim(),
        answer: answer.trim(),
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      },
    })
    return NextResponse.json({ faq }, { status: 201 })
  } catch (err) {
    console.error('Vendor FAQs POST error:', err)
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 })
  }
}
