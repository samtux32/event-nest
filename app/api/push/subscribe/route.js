import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { endpoint, keys } = await request.json()
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 })
    }

    // Find Prisma user (by id, fallback email)
    let dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { id: true } })
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({ where: { email: user.email }, select: { id: true } })
    }
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: { userId: dbUser.id, endpoint },
      },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      create: {
        userId: dbUser.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Push subscribe error:', err)
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { endpoint } = await request.json()
    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })
    }

    let dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { id: true } })
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({ where: { email: user.email }, select: { id: true } })
    }
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.pushSubscription.deleteMany({
      where: { userId: dbUser.id, endpoint },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Push unsubscribe error:', err)
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 })
  }
}
