import prisma from '@/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://eventnest.co.uk';

export default async function sitemap() {
  const staticPages = [
    { url: `${BASE_URL}/marketplace`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/plan-my-event`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  let vendorPages = [];
  try {
    const vendors = await prisma.vendorProfile.findMany({
      where: { isApproved: true },
      select: { id: true, updatedAt: true },
    });

    vendorPages = vendors.map((v) => ({
      url: `${BASE_URL}/vendor-profile/${v.id}`,
      lastModified: v.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch {
    // If DB is unavailable, return static pages only
  }

  return [...staticPages, ...vendorPages];
}
