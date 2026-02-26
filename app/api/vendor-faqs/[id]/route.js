import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

async function getVendorProfile(supabase) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const dbUser = await prisma.user.findFirst({
    where: { OR: [{ id: user.id }, { email: user.email }] },
    include: { vendorProfile: { select: { id: true } } },
  })
  return dbUser?.vendorProfile || null
}

// PUT — update a FAQ
export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const vp = await getVendorProfile(supabase)
    if (!vp) return NextResponse.json({ error: 'Vendor profile not found' }, { status: 403 })

    const existing = await prisma.vendorFAQ.findUnique({ where: { id } })
    if (!existing || existing.vendorId !== vp.id) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 })
    }

    const body = await request.json()
    const faq = await prisma.vendorFAQ.update({
      where: { id },
      data: {
        ...(body.question !== undefined && { question: body.question.trim() }),
        ...(body.answer !== undefined && { answer: body.answer.trim() }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    })
    return NextResponse.json({ faq })
  } catch (err) {
    console.error('Vendor FAQs PUT error:', err)
    return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 })
  }
}

// DELETE — remove a FAQ
export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const vp = await getVendorProfile(supabase)
    if (!vp) return NextResponse.json({ error: 'Vendor profile not found' }, { status: 403 })

    const existing = await prisma.vendorFAQ.findUnique({ where: { id } })
    if (!existing || existing.vendorId !== vp.id) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 })
    }

    await prisma.vendorFAQ.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Vendor FAQs DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 })
  }
}
