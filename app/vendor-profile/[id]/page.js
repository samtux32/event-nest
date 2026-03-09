import prisma from '@/lib/prisma';
import VendorPublicProfile from '@/components/VendorPublicProfile';
import { CATEGORY_TO_SLUG } from '@/lib/seo';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://eventnestgroup.com';

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id },
      select: { businessName: true, categories: true, tagline: true, profileImageUrl: true },
    });

    if (!vendor) {
      return { title: 'Vendor Not Found | Event Nest' };
    }

    const title = `${vendor.businessName} | Event Nest`;
    const description = vendor.tagline || `${vendor.categories?.join(', ')} vendor on Event Nest`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: vendor.profileImageUrl ? [vendor.profileImageUrl] : ['/logo.png'],
      },
      twitter: {
        card: 'summary',
        title,
        description,
        images: vendor.profileImageUrl ? [vendor.profileImageUrl] : ['/logo.png'],
      },
    };
  } catch {
    return { title: 'Vendor | Event Nest' };
  }
}

export default async function VendorProfilePage({ params }) {
  const { id } = await params;

  // Fetch vendor data for JSON-LD schema markup
  let jsonLd = null;
  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id },
      select: {
        businessName: true,
        categories: true,
        tagline: true,
        description: true,
        profileImageUrl: true,
        location: true,
        phone: true,
        email: true,
        website: true,
        averageRating: true,
        totalReviews: true,
        pricePerDay: true,
        pricePerHead: true,
        packages: { orderBy: { sortOrder: 'asc' }, take: 1, select: { price: true } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { rating: true, text: true, createdAt: true, customer: { select: { fullName: true } } },
        },
        faqs: { take: 10, select: { question: true, answer: true } },
      },
    });

    if (vendor) {
      const lowestPrice = vendor.packages?.[0]?.price
        || vendor.pricePerDay
        || vendor.pricePerHead;

      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: vendor.businessName,
        url: `${BASE_URL}/vendor-profile/${id}`,
        description: vendor.tagline || vendor.description?.slice(0, 200) || `${vendor.categories?.join(', ')} vendor on Event Nest`,
        ...(vendor.profileImageUrl && { image: vendor.profileImageUrl }),
        ...(vendor.location && {
          address: {
            '@type': 'PostalAddress',
            addressLocality: vendor.location,
          },
        }),
        ...(vendor.phone && { telephone: vendor.phone }),
        ...(vendor.email && { email: vendor.email }),
        ...(vendor.website && { sameAs: vendor.website }),
        ...(vendor.averageRating && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Number(vendor.averageRating),
            reviewCount: vendor.totalReviews,
            bestRating: 5,
            worstRating: 1,
          },
        }),
        ...(lowestPrice && {
          priceRange: `From £${Number(lowestPrice).toLocaleString('en-GB')}`,
        }),
      };

      // Add individual reviews
      if (vendor.reviews?.length > 0) {
        jsonLd.review = vendor.reviews.map(r => ({
          '@type': 'Review',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: r.rating,
            bestRating: 5,
            worstRating: 1,
          },
          author: {
            '@type': 'Person',
            name: r.customer?.fullName || 'Anonymous',
          },
          datePublished: new Date(r.createdAt).toISOString().slice(0, 10),
          ...(r.text && { reviewBody: r.text }),
        }));
      }

      // Add FAQ schema if vendor has FAQs
      if (vendor.faqs?.length > 0) {
        jsonLd.mainEntity = vendor.faqs.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer,
          },
        }));
      }
    }
  } catch {
    // Schema markup is optional — fail silently
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <VendorPublicProfile vendorId={id} />
    </>
  );
}
