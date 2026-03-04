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

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const profile = await getCustomerProfile(user.id, user.email)
    if (!profile) return NextResponse.json({ checklists: [] })

    const checklists = await prisma.checklist.findMany({
      where: { customerId: profile.id },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ checklists })
  } catch (err) {
    console.error('GET /api/checklists error:', err)
    return NextResponse.json({ error: 'Failed to load checklists' }, { status: 500 })
  }
}

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const profile = await getCustomerProfile(user.id, user.email)
    if (!profile) return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })

    const { name, items, eventDate } = await request.json()
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

    const checklist = await prisma.checklist.create({
      data: {
        customerId: profile.id,
        name,
        eventDate: eventDate ? new Date(eventDate) : null,
        items: items?.length ? {
          create: items.map((item, i) => ({
            text: item.text,
            timeline: item.timeline || null,
            category: item.category || null,
            done: false,
            sortOrder: i,
          })),
        } : undefined,
      },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    })

    return NextResponse.json({ checklist }, { status: 201 })
  } catch (err) {
    console.error('POST /api/checklists error:', err)
    return NextResponse.json({ error: 'Failed to create checklist' }, { status: 500 })
  }
}
