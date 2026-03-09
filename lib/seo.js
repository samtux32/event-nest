// Slug mappings for programmatic SEO pages

export const CATEGORY_SLUGS = {
  'photographers': 'Photography',
  'videographers': 'Videography',
  'caterers': 'Catering',
  'florists': 'Florist',
  'djs': 'DJ',
  'live-bands': 'Live Band/Music',
  'venues': 'Venue',
  'decorators': 'Decorator/Stylist',
  'cake-makers': 'Cake',
  'wedding-planners': 'Wedding Planner',
  'hair-and-makeup': 'Hair & Makeup',
  'transport': 'Transport',
  'stationery': 'Stationery',
  'entertainment': 'Entertainment',
}

// Reverse mapping: category name → slug
export const CATEGORY_TO_SLUG = Object.fromEntries(
  Object.entries(CATEGORY_SLUGS).map(([slug, name]) => [name, slug])
)

// Display names (plural, for page titles)
export const CATEGORY_DISPLAY = {
  'photographers': 'Photographers',
  'videographers': 'Videographers',
  'caterers': 'Caterers',
  'florists': 'Florists',
  'djs': 'DJs',
  'live-bands': 'Live Bands & Musicians',
  'venues': 'Venues',
  'decorators': 'Decorators & Stylists',
  'cake-makers': 'Cake Makers',
  'wedding-planners': 'Wedding Planners',
  'hair-and-makeup': 'Hair & Makeup Artists',
  'transport': 'Transport Services',
  'stationery': 'Stationery Designers',
  'entertainment': 'Entertainment',
}

// UK cities for programmatic pages
export const CITY_SLUGS = {
  'london': 'London',
  'manchester': 'Manchester',
  'birmingham': 'Birmingham',
  'leeds': 'Leeds',
  'bristol': 'Bristol',
  'liverpool': 'Liverpool',
  'edinburgh': 'Edinburgh',
  'glasgow': 'Glasgow',
  'cardiff': 'Cardiff',
  'belfast': 'Belfast',
  'dublin': 'Dublin',
  'nottingham': 'Nottingham',
  'sheffield': 'Sheffield',
  'newcastle': 'Newcastle',
  'brighton': 'Brighton',
  'oxford': 'Oxford',
  'cambridge': 'Cambridge',
  'bath': 'Bath',
  'york': 'York',
  'exeter': 'Exeter',
}

/**
 * Parse a slug like "photographers-in-london" into { categorySlug, citySlug }
 * Also handles category-only slugs like "photographers"
 */
export function parseSlug(slug) {
  const inMatch = slug.match(/^(.+)-in-(.+)$/)
  if (inMatch) {
    return { categorySlug: inMatch[1], citySlug: inMatch[2] }
  }
  return { categorySlug: slug, citySlug: null }
}

/**
 * Build page title from category and city
 */
export function buildTitle(categorySlug, citySlug) {
  const categoryName = CATEGORY_DISPLAY[categorySlug]
  if (!categoryName) return null
  if (citySlug) {
    const cityName = CITY_SLUGS[citySlug]
    if (!cityName) return null
    return `${categoryName} in ${cityName}`
  }
  return categoryName
}

/**
 * Build meta description
 */
export function buildDescription(categorySlug, citySlug) {
  const categoryName = CATEGORY_DISPLAY[categorySlug]
  const dbCategory = CATEGORY_SLUGS[categorySlug]
  if (!categoryName) return null
  if (citySlug) {
    const cityName = CITY_SLUGS[citySlug]
    if (!cityName) return null
    return `Find and book the best ${categoryName.toLowerCase()} in ${cityName}. Compare prices, read verified reviews, and book with confidence on Event Nest.`
  }
  return `Browse top-rated ${categoryName.toLowerCase()} for your event. Compare prices, read verified reviews, and book with confidence on Event Nest.`
}

/**
 * Generate all valid slug combinations for sitemap
 */
export function getAllSlugs() {
  const slugs = []
  for (const catSlug of Object.keys(CATEGORY_SLUGS)) {
    slugs.push(catSlug)
    for (const citySlug of Object.keys(CITY_SLUGS)) {
      slugs.push(`${catSlug}-in-${citySlug}`)
    }
  }
  return slugs
}
