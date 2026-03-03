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
    if (!profile) return NextResponse.json({ plans: [] })

    const plans = await prisma.savedPlan.findMany({
      where: { customerId: profile.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ plans })
  } catch (err) {
    console.error('GET /api/saved-plans error:', err)
    return NextResponse.json({ error: 'Failed to load plans' }, { status: 500 })
  }
}

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const profile = await getCustomerProfile(user.id, user.email)
    if (!profile) return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 })

    const body = await request.json()
    const { prompt, title, theme, totalBudget, categories, tips, vendors, eventDate } = body

    if (!prompt || !title || !categories) {
      return NextResponse.json({ error: 'prompt, title, and categories are required' }, { status: 400 })
    }

    const plan = await prisma.savedPlan.create({
      data: {
        customerId: profile.id,
        prompt,
        title,
        theme: theme || null,
        totalBudget: totalBudget || 0,
        categories,
        tips: tips || null,
        vendors: vendors || null,
        eventDate: eventDate ? new Date(eventDate) : null,
      },
    })

    return NextResponse.json({ plan }, { status: 201 })
  } catch (err) {
    console.error('POST /api/saved-plans error:', err)
    return NextResponse.json({ error: 'Failed to save plan' }, { status: 500 })
  }
}
