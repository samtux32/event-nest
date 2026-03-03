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

export async function POST(request, { params }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const profile = await getCustomerProfile(user.id, user.email)
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { id } = await params
    const checklist = await prisma.checklist.findUnique({ where: { id } })
    if (!checklist || checklist.customerId !== profile.id) {
      return NextResponse.json({ error: 'Checklist not found' }, { status: 404 })
    }

    const { text } = await request.json()
    if (!text) return NextResponse.json({ error: 'text is required' }, { status: 400 })

    const maxOrder = await prisma.checklistItem.aggregate({
      where: { checklistId: id },
      _max: { sortOrder: true },
    })

    const item = await prisma.checklistItem.create({
      data: {
        checklistId: id,
        text,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (err) {
    console.error('POST /api/checklists/[id]/items error:', err)
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 })
  }
}
