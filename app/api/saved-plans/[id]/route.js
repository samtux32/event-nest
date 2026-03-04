import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

async function getCustomerProfile(userId, email) {
  let dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { customerProfile: true },
  })
  if (!dbUser && email) {
    dbUser = await prisma.user.findUnique({
      where: { email },
      include: { customerProfile: true },
    })
  }
  return dbUser?.customerProfile
}

export async function PUT(request, { params }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const profile = await getCustomerProfile(user.id, user.email)
    if (!profile) return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })

    const { id } = await params
    const existing = await prisma.savedPlan.findUnique({ where: { id } })
    if (!existing || existing.customerId !== profile.id) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const body = await request.json()
    const { prompt, title, theme, totalBudget, categories, tips, vendors, checklist, eventDate } = body

    const updated = await prisma.savedPlan.update({
      where: { id },
      data: {
        ...(prompt !== undefined && { prompt }),
        ...(title !== undefined && { title }),
        ...(theme !== undefined && { theme }),
        ...(totalBudget !== undefined && { totalBudget }),
        ...(categories !== undefined && { categories }),
        ...(tips !== undefined && { tips }),
        ...(vendors !== undefined && { vendors }),
        ...(checklist !== undefined && { checklist }),
        ...(eventDate !== undefined && { eventDate: eventDate ? new Date(eventDate) : null }),
      },
    })

    return NextResponse.json({ plan: updated })
  } catch (err) {
    console.error('PUT /api/saved-plans/[id] error:', err)
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const profile = await getCustomerProfile(user.id, user.email)
    if (!profile) return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })

    const { id } = await params
    const existing = await prisma.savedPlan.findUnique({ where: { id } })
    if (!existing || existing.customerId !== profile.id) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    await prisma.savedPlan.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/saved-plans/[id] error:', err)
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 })
  }
}
