import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { formatCurrency } from '@/lib/currency';

export async function GET(request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (user.user_metadata?.role !== 'vendor') return NextResponse.json({ error: 'Vendors only' }, { status: 403 });

  try {
    let vendor = await prisma.vendorProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, userId: true, businessName: true, averageRating: true, totalReviews: true },
    });
    if (!vendor) {
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { vendorProfile: true },
      });
      vendor = dbUser?.vendorProfile ?? null;
    }
    if (!vendor) return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });

    const fmt = (amount) => formatCurrency(amount, 'GBP');

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const [bookings, views, reviews, quoteStats, conversations] = await Promise.all([
      prisma.booking.findMany({
        where: { vendorId: vendor.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, eventType: true, eventDate: true, status: true,
          totalPrice: true, guestCount: true, paymentStatus: true,
          createdAt: true, confirmedAt: true,
        },
      }),
      prisma.profileView.count({
        where: { vendorId: vendor.id, viewedAt: { gte: ninetyDaysAgo } },
      }),
      prisma.review.findMany({
        where: { vendorId: vendor.id },
        orderBy: { createdAt: 'desc' },
        select: {
          rating: true, text: true, createdAt: true,
          customer: { select: { fullName: true } },
        },
      }),
      prisma.quote.groupBy({
        by: ['status'],
        where: { vendorId: vendor.id },
        _count: true,
      }),
      prisma.conversation.findMany({
        where: { vendorId: vendor.id },
        select: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 5,
            select: { senderId: true, createdAt: true },
          },
        },
        take: 100,
      }),
    ]);

    const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
    const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

    // Quote stats
    const totalQuotes = quoteStats.reduce((sum, g) => sum + g._count, 0);
    const acceptedQuotes = quoteStats.find(g => g.status === 'accepted')?._count || 0;

    // Avg response time
    let avgResponseHours = null;
    let responsesFound = 0;
    let totalResponseMs = 0;
    conversations.forEach(conv => {
      if (conv.messages.length < 2) return;
      const firstCustomerMsg = conv.messages.find(m => m.senderId !== vendor.userId);
      const firstVendorReply = conv.messages.find(m => m.senderId === vendor.userId && firstCustomerMsg && new Date(m.createdAt) > new Date(firstCustomerMsg.createdAt));
      if (firstCustomerMsg && firstVendorReply) {
        totalResponseMs += new Date(firstVendorReply.createdAt) - new Date(firstCustomerMsg.createdAt);
        responsesFound++;
      }
    });
    if (responsesFound > 0) {
      avgResponseHours = Math.round((totalResponseMs / responsesFound / (1000 * 60 * 60)) * 10) / 10;
    }

    // Repeat customers
    const customerCounts = {};
    confirmedBookings.forEach(b => { customerCounts[b.customerId] = (customerCounts[b.customerId] || 0) + 1; });
    const uniqueCustomers = Object.keys(customerCounts).length;
    const repeatCustomers = Object.values(customerCounts).filter(c => c > 1).length;

    // Build CSV
    const lines = [];

    lines.push('ANALYTICS EXPORT - ' + vendor.businessName);
    lines.push('Generated: ' + new Date().toLocaleDateString('en-GB'));
    lines.push('');
    lines.push('SUMMARY');
    lines.push('Average Rating,' + (vendor.averageRating ? Number(vendor.averageRating).toFixed(1) : 'N/A'));
    lines.push('Total Reviews,' + (vendor.totalReviews || 0));
    lines.push('Profile Views (90 days),' + views);
    lines.push('Total Bookings,' + bookings.length);
    lines.push('Confirmed Bookings,' + confirmedBookings.length);
    lines.push('Total Revenue,' + fmt(totalRevenue));
    lines.push('Avg Booking Value,' + (confirmedBookings.length > 0 ? fmt(totalRevenue / confirmedBookings.length) : 'N/A'));
    lines.push('Cancellation Rate,' + (bookings.length > 0 ? (cancelledCount / bookings.length * 100).toFixed(1) + '%' : '0%'));
    lines.push('Quote Acceptance Rate,' + (totalQuotes > 0 ? (acceptedQuotes / totalQuotes * 100).toFixed(1) + '%' : 'N/A'));
    lines.push('Avg Response Time,' + (avgResponseHours != null ? avgResponseHours + ' hours' : 'N/A'));
    lines.push('Repeat Customer Rate,' + (uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers * 100).toFixed(1) + '%' : 'N/A'));
    lines.push('');

    // Bookings section
    lines.push('BOOKINGS');
    lines.push('Date,Event Type,Event Date,Status,Payment,Guests,Price');
    bookings.forEach((b) => {
      lines.push([
        new Date(b.createdAt).toLocaleDateString('en-GB'),
        csvEscape(b.eventType || '-'),
        b.eventDate ? new Date(b.eventDate).toLocaleDateString('en-GB') : '-',
        b.status,
        b.paymentStatus || 'unpaid',
        b.guestCount || '-',
        b.totalPrice ? fmt(Number(b.totalPrice)) : '-',
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
        csvEscape(r.text || ''),
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
