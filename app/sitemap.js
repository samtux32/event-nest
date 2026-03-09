import prisma from '@/lib/prisma';
import { getAllSlugs } from '@/lib/seo';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://eventnestgroup.com';

export default async function sitemap() {
  const staticPages = [
    { url: `${BASE_URL}/marketplace`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/plan-my-event`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/vendor-signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/inspiration`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/help`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Programmatic SEO pages — category and category-in-city combinations
  const seoPages = getAllSlugs().map(slug => ({
    url: `${BASE_URL}/vendors/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: slug.includes('-in-') ? 0.8 : 0.9,
  }));

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

  return [...staticPages, ...seoPages, ...vendorPages];
}
