import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { vendorId, source } = await request.json()
    if (!vendorId) return NextResponse.json({ error: 'vendorId required' }, { status: 400 })

    await prisma.profileView.create({
      data: { vendorId, source: source || 'direct_link' },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    // Silently fail — analytics shouldn't break the page
    console.error('Profile view tracking error:', err)
    return NextResponse.json({ ok: false })
  }
}
