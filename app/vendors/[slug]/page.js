import prisma from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  parseSlug, buildTitle, buildDescription,
  CATEGORY_SLUGS, CITY_SLUGS, CATEGORY_DISPLAY, CATEGORY_TO_SLUG, getAllSlugs,
} from '@/lib/seo'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://eventnestgroup.com'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const { categorySlug, citySlug } = parseSlug(slug)
  const title = buildTitle(categorySlug, citySlug)
  if (!title) return { title: 'Vendors | Event Nest' }

  const description = buildDescription(categorySlug, citySlug)
  const fullTitle = `${title} | Event Nest`
  const url = `${BASE_URL}/vendors/${slug}`

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url,
      type: 'website',
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description },
    alternates: { canonical: url },
  }
}

export default async function VendorCategoryPage({ params }) {
  const { slug } = await params
  const { categorySlug, citySlug } = parseSlug(slug)

  const categoryName = CATEGORY_SLUGS[categorySlug]
  const displayName = CATEGORY_DISPLAY[categorySlug]
  const cityName = citySlug ? CITY_SLUGS[citySlug] : null

  if (!categoryName || (citySlug && !cityName)) {
    notFound()
  }

  const title = cityName ? `${displayName} in ${cityName}` : displayName

  // Query vendors matching this category (and optionally city)
  const where = {
    isApproved: true,
    categories: { has: categoryName },
  }
  if (cityName) {
    where.location = { contains: cityName, mode: 'insensitive' }
  }

  const vendors = await prisma.vendorProfile.findMany({
    where,
    include: {
      packages: { orderBy: { sortOrder: 'asc' }, take: 1 },
      reviews: { orderBy: { createdAt: 'desc' }, take: 3, select: { rating: true, text: true, createdAt: true, customer: { select: { fullName: true } } } },
    },
    orderBy: { averageRating: { sort: 'desc', nulls: 'last' } },
    take: 50,
  })

  // Related categories (other categories, excluding current)
  const otherCategories = Object.entries(CATEGORY_DISPLAY)
    .filter(([s]) => s !== categorySlug)
    .slice(0, 8)

  // Related cities (for this category)
  const otherCities = Object.entries(CITY_SLUGS)
    .filter(([s]) => s !== citySlug)
    .slice(0, 10)

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${title} — Event Nest`,
    description: buildDescription(categorySlug, citySlug),
    url: `${BASE_URL}/vendors/${slug}`,
    numberOfItems: vendors.length,
    itemListElement: vendors.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'LocalBusiness',
        name: v.businessName,
        url: `${BASE_URL}/vendor-profile/${v.id}`,
        description: v.tagline || `${categoryName} vendor on Event Nest`,
        ...(v.profileImageUrl && { image: v.profileImageUrl }),
        ...(v.location && { address: { '@type': 'PostalAddress', addressLocality: v.location } }),
        ...(v.averageRating && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Number(v.averageRating),
            reviewCount: v.totalReviews,
            bestRating: 5,
            worstRating: 1,
          },
        }),
      },
    })),
  }

  // FAQ content for the category
  const faqs = buildFAQs(categoryName, displayName, cityName)
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Event Nest" className="w-10 h-10 rounded-lg object-cover" />
            <span className="font-bold text-lg text-gray-900">Event Nest</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/marketplace" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Browse All</Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Log in</Link>
            <Link href="/register" className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700">Sign up</Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <nav className="text-sm text-gray-500">
          <Link href="/" className="hover:text-purple-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/marketplace" className="hover:text-purple-600">Vendors</Link>
          <span className="mx-2">/</span>
          {cityName ? (
            <>
              <Link href={`/vendors/${categorySlug}`} className="hover:text-purple-600">{displayName}</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{cityName}</span>
            </>
          ) : (
            <span className="text-gray-900">{displayName}</span>
          )}
        </nav>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold">
            {title}
          </h1>
          <p className="mt-3 text-purple-100 text-lg max-w-2xl">
            {vendors.length > 0
              ? `Browse ${vendors.length} verified ${displayName.toLowerCase()}${cityName ? ` in ${cityName}` : ''}. Compare prices, read reviews, and book with confidence.`
              : `Find top-rated ${displayName.toLowerCase()}${cityName ? ` in ${cityName}` : ''} on Event Nest.`
            }
          </p>
          <div className="mt-6 flex gap-3">
            <Link href={`/marketplace${cityName ? '' : `?category=${encodeURIComponent(categoryName)}`}`}
              className="bg-white text-purple-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50">
              Browse All {displayName}
            </Link>
            <Link href="/plan-my-event"
              className="border-2 border-white text-white px-6 py-2.5 rounded-lg font-medium hover:bg-white/10">
              AI Event Planner
            </Link>
          </div>
        </div>
      </section>

      {/* Vendor Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {vendors.length > 0 ? (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {vendors.length} {displayName} {cityName ? `in ${cityName}` : 'Available'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((v) => (
                <Link key={v.id} href={`/vendor-profile/${v.id}`} className="block">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                      {v.profileImageUrl ? (
                        <img src={v.profileImageUrl} alt={v.businessName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl">🏪</span>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {v.categories.slice(0, 2).map(c => (
                          <span key={c} className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{c}</span>
                        ))}
                      </div>
                      <h3 className="font-semibold text-gray-900 text-lg">{v.businessName}</h3>
                      {v.tagline && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{v.tagline}</p>}
                      {v.location && (
                        <p className="text-sm text-gray-400 mt-1">{v.location}</p>
                      )}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        {v.averageRating ? (
                          <div className="flex items-center gap-1 text-sm">
                            <span className="text-yellow-500">★</span>
                            <span className="font-medium">{Number(v.averageRating).toFixed(1)}</span>
                            <span className="text-gray-400">({v.totalReviews} review{v.totalReviews !== 1 ? 's' : ''})</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">New vendor</span>
                        )}
                        {v.packages?.[0]?.price && (
                          <span className="text-sm font-medium text-gray-700">
                            From £{Number(v.packages[0].price).toLocaleString('en-GB')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🔍</p>
            <h2 className="text-xl font-semibold text-gray-900">No {displayName.toLowerCase()} found{cityName ? ` in ${cityName}` : ''} yet</h2>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              We&apos;re growing fast. Browse all vendors or try a different location.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href={`/vendors/${categorySlug}`} className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-purple-700">
                All {displayName}
              </Link>
              <Link href="/marketplace" className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50">
                Browse All Vendors
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* FAQ Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions About {title}
        </h2>
        <div className="space-y-4 max-w-3xl">
          {faqs.map((faq, i) => (
            <details key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden group">
              <summary className="px-6 py-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50 list-none flex justify-between items-center">
                {faq.q}
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Cities */}
      {otherCities.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {displayName} in Other Cities
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherCities.map(([cs, cn]) => (
              <Link key={cs} href={`/vendors/${categorySlug}-in-${cs}`}
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:border-purple-300 hover:text-purple-600 transition-colors">
                {displayName} in {cn}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Other Vendor Categories{cityName ? ` in ${cityName}` : ''}
        </h2>
        <div className="flex flex-wrap gap-2">
          {otherCategories.map(([cs, cn]) => (
            <Link key={cs} href={`/vendors/${citySlug ? `${cs}-in-${citySlug}` : cs}`}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:border-purple-300 hover:text-purple-600 transition-colors">
              {cn}{cityName ? ` in ${cityName}` : ''}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-12 mt-6">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold">Ready to Book {displayName === 'Venues' ? 'a Venue' : `a ${displayName.replace(/s$/, '').replace(/ies$/, 'y')}`}?</h2>
          <p className="mt-3 text-purple-100">
            Browse verified vendors, compare prices and reviews, and book with confidence on Event Nest.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/register" className="bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50">
              Sign Up Free
            </Link>
            <Link href="/marketplace" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10">
              Browse Vendors
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">&copy; {new Date().getFullYear()} Event Nest. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/help" className="text-sm hover:text-white">Help & FAQ</Link>
              <Link href="/terms" className="text-sm hover:text-white">Terms</Link>
              <Link href="/privacy" className="text-sm hover:text-white">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function buildFAQs(categoryName, displayName, cityName) {
  const location = cityName ? ` in ${cityName}` : ''
  const faqs = [
    {
      q: `How much do ${displayName.toLowerCase()} cost${location}?`,
      a: `Prices vary depending on the vendor, event size, and requirements. On Event Nest, you can compare prices from multiple ${displayName.toLowerCase()}${location} and request custom quotes to find the best fit for your budget.`,
    },
    {
      q: `How do I book ${displayName.toLowerCase() === 'djs' ? 'a DJ' : `a ${categoryName.toLowerCase()}`}${location} on Event Nest?`,
      a: `Browse our verified ${displayName.toLowerCase()}${location}, compare their packages and reviews, then send a booking request or request a custom quote directly through the platform. The vendor will confirm your booking and you can coordinate all the details via messaging.`,
    },
    {
      q: `Are the ${displayName.toLowerCase()} on Event Nest verified?`,
      a: `Yes. All vendors on Event Nest go through an approval process. Customer reviews are verified — only customers who have completed a booking can leave a review, ensuring you get honest feedback.`,
    },
    {
      q: `Can I see reviews for ${displayName.toLowerCase()}${location}?`,
      a: `Absolutely. Every vendor profile shows verified reviews from real customers, including ratings, written feedback, and event photos. You can filter by rating to find the highest-rated ${displayName.toLowerCase()}.`,
    },
    {
      q: `Is Event Nest free for customers?`,
      a: `Yes, Event Nest is completely free for customers. You can browse vendors, compare prices, send messages, request quotes, and book — all at no cost. Vendors pay a small fee only when a booking is confirmed.`,
    },
  ]
  return faqs
}
