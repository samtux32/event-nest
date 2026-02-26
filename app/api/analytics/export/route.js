import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (user.user_metadata?.role !== 'vendor') return NextResponse.json({ error: 'Vendors only' }, { status: 403 });

  try {
    let vendor = await prisma.vendorProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, businessName: true, averageRating: true, totalReviews: true },
    });
    if (!vendor) {
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { vendorProfile: true },
      });
      vendor = dbUser?.vendorProfile ?? null;
    }
    if (!vendor) return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });

    // Get all bookings
    const bookings = await prisma.booking.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        eventType: true,
        eventDate: true,
        status: true,
        totalPrice: true,
        guestCount: true,
        createdAt: true,
      },
    });

    // Get profile views (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const views = await prisma.profileView.count({
      where: { vendorId: vendor.id, viewedAt: { gte: ninetyDaysAgo } },
    });

    // Get reviews
    const reviews = await prisma.review.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
      select: {
        rating: true,
        comment: true,
        createdAt: true,
        customer: { select: { fullName: true } },
      },
    });

    // Build CSV
    const lines = [];

    // Summary section
    lines.push('ANALYTICS EXPORT - ' + vendor.businessName);
    lines.push('Generated: ' + new Date().toLocaleDateString('en-GB'));
    lines.push('');
    lines.push('SUMMARY');
    lines.push('Average Rating,' + (vendor.averageRating ? Number(vendor.averageRating).toFixed(1) : 'N/A'));
    lines.push('Total Reviews,' + (vendor.totalReviews || 0));
    lines.push('Profile Views (90 days),' + views);
    lines.push('Total Bookings,' + bookings.length);
    lines.push('Confirmed Bookings,' + bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length);
    lines.push('Total Revenue,£' + bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0).toLocaleString());
    lines.push('');

    // Bookings section
    lines.push('BOOKINGS');
    lines.push('Date,Event Type,Event Date,Status,Guests,Price');
    bookings.forEach((b) => {
      lines.push([
        new Date(b.createdAt).toLocaleDateString('en-GB'),
        csvEscape(b.eventType || '-'),
        b.eventDate ? new Date(b.eventDate).toLocaleDateString('en-GB') : '-',
        b.status,
        b.guestCount || '-',
        b.totalPrice ? '£' + Number(b.totalPrice).toLocaleString() : '-',
      ].join(','));
    });
    lines.push('');

    // Reviews section
    lines.push('REVIEWS');
    lines.push('Date,Customer,Rating,Comment');
    reviews.forEach((r) => {
      lines.push([
        new Date(r.createdAt).toLocaleDateString('en-GB'),
        csvEscape(r.customer?.fullName || 'Anonymous'),
        r.rating,
        csvEscape(r.comment || ''),
      ].join(','));
    });

    const csv = lines.join('\n');
    const filename = `${vendor.businessName.replace(/[^a-zA-Z0-9]/g, '-')}-analytics-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('Analytics export error:', err);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

function csvEscape(str) {
  if (typeof str !== 'string') return str;
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}
