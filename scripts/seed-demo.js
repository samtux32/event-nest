// Run with: node scripts/seed-demo.js
// Creates realistic demo data so the platform looks like an active marketplace.
// ALL demo accounts use @eventnest-demo.com — run clean-demo.js to remove them.

const { createClient } = require('@supabase/supabase-js')
const { PrismaClient } = require('@prisma/client')
require('dotenv').config({ path: '.env' })

const prisma = new PrismaClient()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SUFFIX = '@eventnest-demo.com'
const PASSWORD = 'DemoPass123!'

// ─── Vendor Data ────────────────────────────────────────────────────────────

const VENDORS = [
  {
    email: `bella.photography${SUFFIX}`,
    businessName: 'Bella Vista Photography',
    category: 'Photography',
    tagline: 'Capturing your most precious moments with natural, timeless imagery',
    description: 'Award-winning wedding and event photographer based in London with over 12 years of experience. We specialise in relaxed, candid photography that tells your unique story. Our style is natural and documentary — we blend into the background so you can enjoy your day, while we capture every genuine moment.',
    location: 'London, UK',
    yearsExperience: 12,
    pricePerDay: 1800,
    pricingModel: 'per_day',
    responseTime: 'Within 2 hours',
    phone: '+44 7700 900111',
    email: `bella.photography${SUFFIX}`,
    instagram: '@bellavistaphoto',
    profileImageUrl: 'https://picsum.photos/seed/bella-profile/400/400',
    coverImageUrl: 'https://picsum.photos/seed/bella-cover/1200/500',
    portfolioImages: [
      { url: 'https://picsum.photos/seed/bella-p1/800/600', caption: 'Summer wedding at The Savoy' },
      { url: 'https://picsum.photos/seed/bella-p2/800/600', caption: 'Outdoor ceremony, Richmond Park' },
      { url: 'https://picsum.photos/seed/bella-p3/800/600', caption: 'Black-tie corporate gala' },
      { url: 'https://picsum.photos/seed/bella-p4/800/600', caption: 'Intimate garden party' },
      { url: 'https://picsum.photos/seed/bella-p5/800/600', caption: '21st birthday celebration' },
      { url: 'https://picsum.photos/seed/bella-p6/800/600', caption: 'Engagement shoot, Hyde Park' },
    ],
    packages: [
      { name: 'Essential', price: 900, duration: '4 hours', sortOrder: 0, features: ['1 photographer', '200+ edited photos', 'Online gallery', 'Digital download', 'Print licence'] },
      { name: 'Classic', price: 1800, duration: '8 hours', isPopular: true, sortOrder: 1, features: ['2 photographers', '500+ edited photos', 'Online gallery', 'USB keepsake drive', 'Print licence', 'Same-day preview'] },
      { name: 'Luxury', price: 2900, duration: 'Full day + engagement shoot', sortOrder: 2, features: ['2 photographers', '800+ edited photos', 'Online gallery', 'USB drive', 'Luxury photo album', 'Engagement shoot included', 'Rush 2-week delivery'] },
    ],
    awards: [
      { title: 'UK Wedding Photography Awards — Highly Commended', year: 2024 },
      { title: 'Bride & Groom Magazine — Top 10 UK Photographers', year: 2023 },
    ],
  },
  {
    email: `spice.catering${SUFFIX}`,
    businessName: 'Spice & Co Catering',
    category: 'Catering',
    tagline: 'Extraordinary food for extraordinary occasions',
    description: 'Spice & Co is a premium event catering company serving London and the South East. From intimate dinner parties to large corporate events, our team of professional chefs craft seasonal menus using the finest local and sustainable ingredients. We handle everything from canapés to a full three-course seated dinner.',
    location: 'Surrey, UK',
    yearsExperience: 8,
    pricePerHead: 75,
    pricingModel: 'per_head',
    responseTime: 'Within 4 hours',
    phone: '+44 7700 900222',
    email: `spice.catering${SUFFIX}`,
    instagram: '@spiceandcocatering',
    profileImageUrl: 'https://picsum.photos/seed/spice-profile/400/400',
    coverImageUrl: 'https://picsum.photos/seed/spice-cover/1200/500',
    portfolioImages: [
      { url: 'https://picsum.photos/seed/spice-p1/800/600', caption: 'Canapé reception, 200 guests' },
      { url: 'https://picsum.photos/seed/spice-p2/800/600', caption: 'Seated wedding breakfast' },
      { url: 'https://picsum.photos/seed/spice-p3/800/600', caption: 'Corporate awards dinner' },
      { url: 'https://picsum.photos/seed/spice-p4/800/600', caption: 'Outdoor festival catering' },
    ],
    packages: [
      { name: 'Canapés & Bowl Food', price: 45, duration: 'Per head', sortOrder: 0, features: ['8 canapé varieties', '3 bowl food options', 'Serving staff included', 'Crockery & glassware'] },
      { name: 'Wedding Breakfast', price: 75, duration: 'Per head', isPopular: true, sortOrder: 1, features: ['3-course seated meal', 'Canapés on arrival', 'Full serving team', 'Crockery, linen & glassware', 'Menu tasting included'] },
      { name: 'Full Day Package', price: 110, duration: 'Per head', sortOrder: 2, features: ['Welcome drinks & canapés', '3-course breakfast', 'Evening buffet', 'Full serving team', 'Bar staff', 'Menu tasting included'] },
    ],
    awards: [
      { title: 'Surrey Business Awards — Caterer of the Year', year: 2023 },
    ],
  },
  {
    email: `bloom.room${SUFFIX}`,
    businessName: 'The Bloom Room',
    category: 'Florist',
    tagline: 'Floral artistry that transforms spaces',
    description: 'The Bloom Room is a luxury floral design studio based in Kensington, creating breathtaking arrangements for weddings, corporate events, and private celebrations. Led by award-winning florist Charlotte Hayes, our team works closely with each client to design bespoke florals that reflect their personality and vision.',
    location: 'Kensington, London',
    yearsExperience: 9,
    pricePerDay: 2200,
    pricingModel: 'per_day',
    responseTime: 'Within 3 hours',
    phone: '+44 7700 900333',
    email: `bloom.room${SUFFIX}`,
    instagram: '@thebloomroom',
    profileImageUrl: 'https://picsum.photos/seed/bloom-profile/400/400',
    coverImageUrl: 'https://picsum.photos/seed/bloom-cover/1200/500',
    portfolioImages: [
      { url: 'https://picsum.photos/seed/bloom-p1/800/600', caption: 'Romantic arch installation' },
      { url: 'https://picsum.photos/seed/bloom-p2/800/600', caption: 'Table centrepieces, wedding reception' },
      { url: 'https://picsum.photos/seed/bloom-p3/800/600', caption: 'Corporate event floral wall' },
      { url: 'https://picsum.photos/seed/bloom-p4/800/600', caption: 'Bridal bouquet in ivory & blush' },
      { url: 'https://picsum.photos/seed/bloom-p5/800/600', caption: 'Ceremony aisle décor' },
    ],
    packages: [
      { name: 'Bridal Party', price: 650, duration: 'Bridal flowers only', sortOrder: 0, features: ['Bridal bouquet', '3 bridesmaid bouquets', 'Buttonholes x6', 'Flower girl posy', 'Delivery & setup'] },
      { name: 'Ceremony & Reception', price: 2200, duration: 'Full venue dressing', isPopular: true, sortOrder: 1, features: ['All bridal party flowers', 'Ceremony arch or backdrop', 'Aisle flowers', '8 table centrepieces', 'Top table arrangement', 'Delivery & full setup'] },
      { name: 'Complete Package', price: 3800, duration: 'Full day floral design', sortOrder: 2, features: ['Everything in Ceremony & Reception', 'Welcome arrangement', 'Cake flowers', 'Evening room refresh', 'Post-event collection & breakdown'] },
    ],
    awards: [
      { title: 'Chelsea Flower Show — Best in Category (Event Floristry)', year: 2024 },
      { title: 'UK Wedding Awards — Florist of the Year, London', year: 2022 },
    ],
  },
  {
    email: `bassline.dj${SUFFIX}`,
    businessName: 'BassLine DJ Services',
    category: 'Entertainment',
    tagline: 'Professional DJ services that keep the dance floor packed',
    description: 'BassLine is London\'s premier DJ and entertainment agency. With 15 years in the industry, we\'ve performed at over 800 events — from intimate birthday parties to large-scale corporate events and weddings for 400+ guests. We provide state-of-the-art sound and lighting equipment and read every crowd to keep the energy exactly right.',
    location: 'East London, UK',
    yearsExperience: 15,
    pricePerDay: 1200,
    pricingModel: 'per_day',
    responseTime: 'Within 1 hour',
    phone: '+44 7700 900444',
    email: `bassline.dj${SUFFIX}`,
    instagram: '@basslinedjservices',
    profileImageUrl: 'https://picsum.photos/seed/bassline-profile/400/400',
    coverImageUrl: 'https://picsum.photos/seed/bassline-cover/1200/500',
    portfolioImages: [
      { url: 'https://picsum.photos/seed/bass-p1/800/600', caption: 'Wedding reception at The Shard' },
      { url: 'https://picsum.photos/seed/bass-p2/800/600', caption: 'Corporate Christmas party' },
      { url: 'https://picsum.photos/seed/bass-p3/800/600', caption: '40th birthday warehouse party' },
    ],
    packages: [
      { name: 'Party Pack', price: 600, duration: '4 hours', sortOrder: 0, features: ['1 professional DJ', 'PA sound system', 'Basic lighting rig', 'Spotify/request integration', 'MC announcements'] },
      { name: 'Wedding Package', price: 1200, duration: '6 hours', isPopular: true, sortOrder: 1, features: ['1 professional DJ', 'Premium sound system', 'Full LED lighting rig', 'Wireless microphone', 'First dance coordination', 'MC announcements', 'Pre-event consultation'] },
      { name: 'Platinum Night', price: 2000, duration: '8 hours', sortOrder: 2, features: ['2 DJs', 'Premium sound system', 'Full LED & moving head lighting', 'Wireless microphone', 'Photo booth integration', 'MC & host service', 'Fog machine', 'Pre-event site visit'] },
    ],
    awards: [],
  },
  {
    email: `perfect.planning${SUFFIX}`,
    businessName: 'Perfect Day Planning',
    category: 'Wedding Planning',
    tagline: 'We handle every detail so you can enjoy every moment',
    description: 'Perfect Day Planning is a full-service wedding planning and coordination company based in Central London. With our team of experienced planners, we work with couples from the moment they get engaged right through to the last dance. We have established relationships with London\'s finest venues, caterers, and suppliers — meaning you get the best, at the best price.',
    location: 'Central London, UK',
    yearsExperience: 11,
    pricePerDay: 3500,
    pricingModel: 'per_day',
    responseTime: 'Within 2 hours',
    phone: '+44 7700 900555',
    email: `perfect.planning${SUFFIX}`,
    instagram: '@perfectdayplanning',
    profileImageUrl: 'https://picsum.photos/seed/planning-profile/400/400',
    coverImageUrl: 'https://picsum.photos/seed/planning-cover/1200/500',
    portfolioImages: [
      { url: 'https://picsum.photos/seed/plan-p1/800/600', caption: 'Luxury marquee wedding, Oxfordshire' },
      { url: 'https://picsum.photos/seed/plan-p2/800/600', caption: 'Rooftop ceremony, Central London' },
      { url: 'https://picsum.photos/seed/plan-p3/800/600', caption: 'Country house estate wedding' },
      { url: 'https://picsum.photos/seed/plan-p4/800/600', caption: 'Intimate destination wedding, Tuscany' },
    ],
    packages: [
      { name: 'On-The-Day Coordination', price: 1200, duration: 'Wedding day only', sortOrder: 0, features: ['Full day coordinator', 'Supplier liaison', 'Timeline management', 'Ceremony & reception management', 'Emergency kit'] },
      { name: 'Partial Planning', price: 2500, duration: '3 months support', isPopular: true, sortOrder: 1, features: ['Dedicated wedding planner', 'Venue & supplier sourcing', 'Budget management', 'Monthly planning meetings', 'On-the-day coordination', 'Rehearsal management'] },
      { name: 'Full Planning', price: 5500, duration: 'Engagement to wedding day', sortOrder: 2, features: ['Full-service planning from engagement', 'Unlimited consultations', 'Exclusive venue access', 'Supplier negotiation & management', 'Complete budget management', 'Design & styling direction', 'On-the-day team of 2'] },
    ],
    awards: [
      { title: 'Hitched Awards — Wedding Planner of the Year, London', year: 2024 },
      { title: 'Vogue UK — Top 10 Luxury Wedding Planners', year: 2023 },
    ],
  },
  {
    email: `manor.venue${SUFFIX}`,
    businessName: 'Ashford Manor Events',
    category: 'Venue',
    tagline: 'A stunning historic estate for unforgettable celebrations',
    description: 'Ashford Manor is a beautifully restored 17th-century manor house set in 40 acres of manicured grounds in the Surrey Hills. With licensed ceremony rooms, a grand reception hall, and exclusive overnight accommodation for 60 guests, Ashford Manor is one of the South East\'s most sought-after exclusive-use wedding and event venues.',
    location: 'Surrey Hills, UK',
    yearsExperience: 6,
    pricePerDay: 5500,
    pricingModel: 'per_day',
    responseTime: 'Within 4 hours',
    phone: '+44 1483 900666',
    email: `manor.venue${SUFFIX}`,
    website: 'https://ashfordmanor.co.uk',
    profileImageUrl: 'https://picsum.photos/seed/manor-profile/400/400',
    coverImageUrl: 'https://picsum.photos/seed/manor-cover/1200/500',
    portfolioImages: [
      { url: 'https://picsum.photos/seed/manor-p1/800/600', caption: 'The Grand Hall dressed for a winter wedding' },
      { url: 'https://picsum.photos/seed/manor-p2/800/600', caption: 'Outdoor ceremony on the south lawn' },
      { url: 'https://picsum.photos/seed/manor-p3/800/600', caption: 'The Orangery — private dining for 40' },
      { url: 'https://picsum.photos/seed/manor-p4/800/600', caption: 'Aerial view of the estate' },
      { url: 'https://picsum.photos/seed/manor-p5/800/600', caption: 'Bridal suite with garden views' },
    ],
    packages: [
      { name: 'Weekday Exclusive', price: 3500, duration: 'Monday–Thursday', sortOrder: 0, features: ['Exclusive use of all venue spaces', 'Up to 120 day guests', 'Accommodation for 60 guests', 'Dedicated venue coordinator', 'Tables, chairs & linen'] },
      { name: 'Weekend Exclusive', price: 5500, duration: 'Friday–Sunday', isPopular: true, sortOrder: 1, features: ['Exclusive use of all venue spaces', 'Up to 200 day guests', 'Accommodation for 60 guests', 'Two-night accommodation', 'Dedicated venue coordinator', 'Tables, chairs & linen', 'Grounds for outdoor ceremony'] },
      { name: 'Full Estate Buyout', price: 9500, duration: 'Three-night exclusive', sortOrder: 2, features: ['Three-night exclusive use', 'Up to 250 guests', 'Accommodation for 60 guests', 'Dedicated team of 3 coordinators', 'Rehearsal dinner included', 'Day-after brunch', 'Full estate access including woodland'] },
    ],
    awards: [
      { title: 'Condé Nast Johansens — Most Excellent Wedding Venue', year: 2024 },
      { title: 'Good Hotel Guide — Recommended', year: 2023 },
    ],
  },
]

// ─── Customer Data ───────────────────────────────────────────────────────────

const CUSTOMERS = [
  {
    email: `sophie.carter${SUFFIX}`,
    fullName: 'Sophie Carter',
    phone: '+44 7700 901001',
  },
  {
    email: `james.wilson${SUFFIX}`,
    fullName: 'James Wilson',
    phone: '+44 7700 901002',
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function addMessages(conversationId, thread) {
  for (const msg of thread) {
    await prisma.message.create({
      data: { conversationId, senderId: msg.senderId, text: msg.text, createdAt: msg.createdAt, isRead: true },
    })
  }
  const last = thread[thread.length - 1]
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: last.createdAt },
  })
}

async function createAuthUser(email, role) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { role },
  })
  if (error) throw new Error(`Auth error for ${email}: ${error.message}`)
  return data.user
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding demo data...\n')

  // ── 1. Create customers ──────────────────────────────────────────────────
  console.log('Creating customers...')
  const createdCustomers = []

  for (const c of CUSTOMERS) {
    const authUser = await createAuthUser(c.email, 'customer')
    await prisma.user.create({
      data: {
        id: authUser.id,
        email: c.email,
        role: 'customer',
        customerProfile: {
          create: { fullName: c.fullName, phone: c.phone },
        },
      },
    })
    const profile = await prisma.customerProfile.findUnique({ where: { userId: authUser.id } })
    createdCustomers.push({ ...c, userId: authUser.id, profileId: profile.id })
    console.log(`  ✓ ${c.fullName} (${c.email})`)
  }

  // ── 2. Create vendors ────────────────────────────────────────────────────
  console.log('\nCreating vendors...')
  const createdVendors = []

  for (const v of VENDORS) {
    const authUser = await createAuthUser(v.email, 'vendor')

    const vendor = await prisma.user.create({
      data: {
        id: authUser.id,
        email: v.email,
        role: 'vendor',
        vendorProfile: {
          create: {
            businessName: v.businessName,
            category: v.category,
            tagline: v.tagline,
            description: v.description,
            location: v.location,
            yearsExperience: v.yearsExperience,
            pricePerDay: v.pricingModel !== 'per_head' ? v.pricePerDay : null,
            pricePerHead: v.pricingModel === 'per_head' ? v.pricePerHead : null,
            pricingModel: v.pricingModel,
            responseTime: v.responseTime,
            phone: v.phone,
            instagram: v.instagram || null,
            website: v.website || null,
            profileImageUrl: v.profileImageUrl,
            coverImageUrl: v.coverImageUrl,
            isApproved: true,
            isAvailable: true,
            profileCompletion: 95,
            packages: {
              create: v.packages.map(p => ({
                name: p.name,
                price: p.price,
                duration: p.duration,
                isPopular: p.isPopular || false,
                sortOrder: p.sortOrder,
                features: p.features,
              })),
            },
            portfolioImages: {
              create: v.portfolioImages.map((img, i) => ({
                imageUrl: img.url,
                caption: img.caption,
                sortOrder: i,
              })),
            },
            awards: v.awards.length > 0 ? {
              create: v.awards.map(a => ({ title: a.title, year: a.year })),
            } : undefined,
          },
        },
      },
      include: { vendorProfile: { include: { packages: true } } },
    })

    createdVendors.push({
      ...v,
      userId: authUser.id,
      profileId: vendor.vendorProfile.id,
      packages: vendor.vendorProfile.packages,
    })
    console.log(`  ✓ ${v.businessName} (${v.email})`)
  }

  // ── 3. Create bookings & conversations ───────────────────────────────────
  console.log('\nCreating bookings...')

  const sophie = createdCustomers[0]
  const james = createdCustomers[1]
  const bellaVista = createdVendors[0]
  const spice = createdVendors[1]
  const bloomRoom = createdVendors[2]
  const bassLine = createdVendors[3]
  const perfectDay = createdVendors[4]

  const sophieWeddingDate = new Date('2025-09-14')
  const jamesPartyDate = new Date('2026-04-12')
  const sophieFloristDate = new Date('2025-09-14')

  // Booking 1: Sophie + Bella Vista — COMPLETED (enables a review)
  const pkg1 = bellaVista.packages.find(p => p.name === 'Classic')
  const b1 = await prisma.booking.create({
    data: {
      vendorId: bellaVista.profileId,
      customerId: sophie.profileId,
      packageId: pkg1.id,
      eventDate: sophieWeddingDate,
      eventType: 'Wedding',
      guestCount: 120,
      venueName: 'Ashford Manor',
      contactName: sophie.fullName,
      contactEmail: sophie.email,
      contactPhone: sophie.phone,
      startTime: '12:00',
      endTime: '22:00',
      specialRequests: 'We would love some golden hour shots in the gardens. My grandmother will be there and she is very important to us — please make sure to capture her.',
      hearAbout: 'Search Results',
      status: 'completed',
      totalPrice: pkg1.price,
      vendorFee: Number(pkg1.price) * 0.10,
      customerFee: Number(pkg1.price) * 0.02,
      confirmedAt: new Date('2025-01-10'),
    },
  })
  const c1 = await prisma.conversation.create({
    data: { vendorId: bellaVista.profileId, customerId: sophie.profileId, bookingId: b1.id },
  })
  console.log('  ✓ Sophie + Bella Vista Photography (completed)')

  // Booking 2: Sophie + The Bloom Room — CONFIRMED
  const pkg2 = bloomRoom.packages.find(p => p.name === 'Ceremony & Reception')
  const b2 = await prisma.booking.create({
    data: {
      vendorId: bloomRoom.profileId,
      customerId: sophie.profileId,
      packageId: pkg2.id,
      eventDate: sophieFloristDate,
      eventType: 'Wedding',
      guestCount: 120,
      venueName: 'Ashford Manor',
      contactName: sophie.fullName,
      contactEmail: sophie.email,
      contactPhone: sophie.phone,
      hearAbout: 'Category Browse',
      status: 'confirmed',
      totalPrice: pkg2.price,
      vendorFee: Number(pkg2.price) * 0.10,
      customerFee: Number(pkg2.price) * 0.02,
      confirmedAt: new Date('2025-02-01'),
    },
  })
  const c2 = await prisma.conversation.create({
    data: { vendorId: bloomRoom.profileId, customerId: sophie.profileId, bookingId: b2.id },
  })
  console.log('  ✓ Sophie + The Bloom Room (confirmed)')

  // Booking 3: James + BassLine DJ — CONFIRMED
  const pkg3 = bassLine.packages.find(p => p.name === 'Wedding Package')
  const b3 = await prisma.booking.create({
    data: {
      vendorId: bassLine.profileId,
      customerId: james.profileId,
      packageId: pkg3.id,
      eventDate: jamesPartyDate,
      eventType: 'Birthday Party',
      guestCount: 80,
      venueName: 'Rooftop at The Curtain Hotel',
      contactName: james.fullName,
      contactEmail: james.email,
      contactPhone: james.phone,
      startTime: '19:00',
      endTime: '02:00',
      specialRequests: '90s and 00s music for the first hour, then transition to current chart music. Surprise entrance needed at 9pm.',
      hearAbout: 'Social Media',
      status: 'confirmed',
      totalPrice: pkg3.price,
      vendorFee: Number(pkg3.price) * 0.10,
      customerFee: Number(pkg3.price) * 0.02,
      confirmedAt: new Date('2026-01-20'),
    },
  })
  const c3 = await prisma.conversation.create({
    data: { vendorId: bassLine.profileId, customerId: james.profileId, bookingId: b3.id },
  })
  console.log('  ✓ James + BassLine DJ (confirmed)')

  // Booking 4: James + Spice & Co — NEW INQUIRY
  const pkg4 = spice.packages.find(p => p.name === 'Wedding Breakfast')
  const b4 = await prisma.booking.create({
    data: {
      vendorId: spice.profileId,
      customerId: james.profileId,
      packageId: pkg4.id,
      eventDate: jamesPartyDate,
      eventType: 'Birthday Party',
      guestCount: 80,
      contactName: james.fullName,
      contactEmail: james.email,
      contactPhone: james.phone,
      hearAbout: 'Referral',
      specialRequests: 'Several guests have dietary requirements including 2 vegans, 3 coeliacs, and 1 nut allergy. Please can you accommodate?',
      status: 'new_inquiry',
      totalPrice: Number(pkg4.price) * 80,
      vendorFee: Number(pkg4.price) * 80 * 0.10,
      customerFee: Number(pkg4.price) * 80 * 0.02,
    },
  })
  const c4 = await prisma.conversation.create({
    data: { vendorId: spice.profileId, customerId: james.profileId, bookingId: b4.id },
  })
  console.log('  ✓ James + Spice & Co Catering (new inquiry)')

  // Booking 5: Sophie + Perfect Day Planning — NEW INQUIRY
  const pkg5 = perfectDay.packages.find(p => p.name === 'Partial Planning')
  const b5 = await prisma.booking.create({
    data: {
      vendorId: perfectDay.profileId,
      customerId: sophie.profileId,
      packageId: pkg5.id,
      eventDate: sophieWeddingDate,
      eventType: 'Wedding',
      guestCount: 120,
      contactName: sophie.fullName,
      contactEmail: sophie.email,
      contactPhone: sophie.phone,
      hearAbout: 'Search Results',
      status: 'new_inquiry',
      totalPrice: pkg5.price,
      vendorFee: Number(pkg5.price) * 0.10,
      customerFee: Number(pkg5.price) * 0.02,
    },
  })
  const c5 = await prisma.conversation.create({
    data: { vendorId: perfectDay.profileId, customerId: sophie.profileId, bookingId: b5.id },
  })
  console.log('  ✓ Sophie + Perfect Day Planning (new inquiry)')

  // ── 4. Create reviews ────────────────────────────────────────────────────
  console.log('\nCreating reviews...')

  // Sophie reviews Bella Vista — 5 stars
  const r1 = await prisma.review.create({
    data: {
      vendorId: bellaVista.profileId,
      customerId: sophie.profileId,
      bookingId: b1.id,
      rating: 5,
      text: 'Absolutely blown away by Bella Vista. From the very first call, they put us completely at ease. On the day, they blended in seamlessly and we genuinely forgot they were there — which meant every photo is completely natural and unposed. The golden hour shots in the gardens are the most beautiful photos I have ever seen. We have had so many compliments. Cannot recommend them highly enough.',
      photos: [],
      eventDate: 'September 2025',
    },
  })

  // Vendor reply to Sophie's review
  await prisma.reviewReply.create({
    data: {
      reviewId: r1.id,
      vendorId: bellaVista.profileId,
      text: 'Sophie, thank you so much for this wonderful review — it truly made our day! It was an absolute privilege to be part of your wedding. The golden hour light that evening was magical, and you were both so natural in front of the camera. We hope to work with you again someday for anniversaries or family portraits!',
    },
  })

  // Update Bella Vista's average rating
  await prisma.vendorProfile.update({
    where: { id: bellaVista.profileId },
    data: { averageRating: 5.0, totalReviews: 1 },
  })
  console.log('  ✓ Sophie reviewed Bella Vista Photography (5★ + vendor reply)')

  // ── 5. Create message threads ─────────────────────────────────────────────
  console.log('\nCreating message threads...')

  // Conversation 1: Sophie ↔ Bella Vista Photography (completed booking)
  await addMessages(c1.id, [
    { senderId: sophie.userId, text: 'Hi! I have just submitted an inquiry for our wedding on 14th September. We are so excited — your portfolio is absolutely stunning!', createdAt: new Date('2025-01-08T10:30:00') },
    { senderId: bellaVista.userId, text: 'Hello Sophie! Thank you so much, we are really excited to hear from you. Your date is free in our diary — I\'d love to hop on a quick call to hear more about your vision. Are you free this week?', createdAt: new Date('2025-01-08T11:15:00') },
    { senderId: sophie.userId, text: 'Yes, of course! Thursday afternoon works well for us.', createdAt: new Date('2025-01-08T11:45:00') },
    { senderId: bellaVista.userId, text: 'Thursday at 3pm is perfect. I\'ll send a calendar invite over shortly. In the meantime, we have a wedding gallery you might love — very similar style to what we\'d create for you.', createdAt: new Date('2025-01-08T12:00:00') },
    { senderId: sophie.userId, text: 'We\'ve been looking at your portfolio all evening! We especially love the golden hour shots. Is that something you can plan around?', createdAt: new Date('2025-01-08T20:30:00') },
    { senderId: bellaVista.userId, text: 'Golden hour is absolutely our favourite time to shoot. At Ashford Manor the light through the gardens around 6–7pm is magical — we\'ll plan your timeline around it. See you Thursday!', createdAt: new Date('2025-01-08T20:48:00') },
    { senderId: bellaVista.userId, text: 'Great speaking with you both today! I\'ve sent over the booking confirmation and our wedding guide. Just let me know if you have any questions before the big day.', createdAt: new Date('2025-01-10T16:30:00') },
    { senderId: sophie.userId, text: 'Thank you so much! We\'re so relieved to have the photography sorted. This is going to be amazing 😊', createdAt: new Date('2025-01-10T17:05:00') },
    { senderId: sophie.userId, text: 'Just wanted to say — we received our gallery yesterday and are completely blown away 😭 The golden hour shots are everything we dreamed of. Thank you for making our day so special.', createdAt: new Date('2025-10-02T14:30:00') },
    { senderId: bellaVista.userId, text: 'Sophie, this message has made our whole week! It was such a privilege to be part of your day. The light in those gardens was absolutely perfect. Congratulations again to you both! 💛', createdAt: new Date('2025-10-02T15:12:00') },
  ])
  console.log('  ✓ Sophie ↔ Bella Vista Photography (10 messages)')

  // Conversation 2: Sophie ↔ The Bloom Room (confirmed booking)
  await addMessages(c2.id, [
    { senderId: sophie.userId, text: 'Hello! We submitted an inquiry for our wedding florals on 14th September. We\'re getting married at Ashford Manor and would love to use The Bloom Room — your work is gorgeous.', createdAt: new Date('2025-01-20T09:15:00') },
    { senderId: bloomRoom.userId, text: 'Sophie, congratulations on your upcoming wedding! Ashford Manor is a dream venue — the grounds are so beautiful. I\'d love to hear more about your vision. What colour palette are you thinking?', createdAt: new Date('2025-01-20T10:00:00') },
    { senderId: sophie.userId, text: 'We are going for ivory, blush and soft sage green — quite romantic and garden-inspired. I really love the look of loose, natural arrangements rather than very structured ones.', createdAt: new Date('2025-01-20T10:30:00') },
    { senderId: bloomRoom.userId, text: 'That combination is absolutely beautiful and will look stunning at Ashford Manor. I\'m picturing garden roses, ranunculus and eucalyptus. Would you like to book a consultation at our studio? We can go through flowers, arrangements and do a small mock-up.', createdAt: new Date('2025-01-20T11:15:00') },
    { senderId: sophie.userId, text: 'That sounds perfect! We are free any Saturday in February.', createdAt: new Date('2025-01-20T11:45:00') },
    { senderId: bloomRoom.userId, text: 'Wonderful — I\'ve pencilled in Saturday 8th February at 11am. I\'ll send the studio address. So looking forward to meeting you both!', createdAt: new Date('2025-01-20T12:00:00') },
    { senderId: sophie.userId, text: 'We are confirmed! We\'ve just signed the contract. Cannot wait for the consultation 🌸', createdAt: new Date('2025-02-01T14:20:00') },
    { senderId: bloomRoom.userId, text: 'Wonderful news — officially in the diary! I\'ll have some mood boards and sample arrangements ready for Saturday. See you soon!', createdAt: new Date('2025-02-01T15:00:00') },
  ])
  console.log('  ✓ Sophie ↔ The Bloom Room (8 messages)')

  // Conversation 3: James ↔ BassLine DJ (confirmed booking)
  await addMessages(c3.id, [
    { senderId: james.userId, text: 'Hi BassLine! I\'ve submitted an inquiry for my 40th birthday party on 12th April at The Curtain Hotel rooftop. 80 guests, evening party from 7pm. Looking for a DJ who can really keep the energy up!', createdAt: new Date('2026-01-15T18:30:00') },
    { senderId: bassLine.userId, text: 'Hey James, happy early 40th! The Curtain rooftop is a brilliant venue. Tell me more about the music brief — what kind of vibe are you going for?', createdAt: new Date('2026-01-15T19:05:00') },
    { senderId: james.userId, text: 'First hour I\'d love 90s and 00s bangers to get people warmed up, then transition to current chart music as the night goes on. Also there\'s a surprise entrance planned for 9pm — I\'ll need a specific track to play.', createdAt: new Date('2026-01-15T19:30:00') },
    { senderId: bassLine.userId, text: 'Love it — that\'s a classic format and always goes down brilliantly. What\'s the track for the 9pm entrance? We\'ll make sure it\'s cued up perfectly. Also what time can we get into the venue for setup?', createdAt: new Date('2026-01-15T20:00:00') },
    { senderId: james.userId, text: 'Entry is from 5pm. The track is "Mr Brightside" — we want a big dramatic moment! The venue has its own sound system but I\'m not sure of the specs — I\'ll check with them.', createdAt: new Date('2026-01-15T20:20:00') },
    { senderId: bassLine.userId, text: 'Ha, excellent choice — always gets a crowd going! No worries on the sound system, I\'ll liaise directly with The Curtain\'s events team. Just confirmed your booking — looking forward to making it a night to remember! 🎉', createdAt: new Date('2026-01-20T11:30:00') },
    { senderId: james.userId, text: 'Brilliant, thank you! Really looking forward to it. I\'ll be in touch closer to the date with the final guest list and any other details.', createdAt: new Date('2026-01-20T12:10:00') },
  ])
  console.log('  ✓ James ↔ BassLine DJ (7 messages)')

  // Conversation 4: James ↔ Spice & Co (new inquiry — vendor has replied, awaiting James)
  await addMessages(c4.id, [
    { senderId: james.userId, text: 'Hello! I\'ve submitted a catering inquiry for my 40th birthday on 12th April, around 80 guests at The Curtain Hotel. Important note: we have several dietary requirements — 2 vegans, 3 coeliacs and 1 nut allergy. Can you accommodate?', createdAt: new Date('2026-01-28T10:00:00') },
    { senderId: spice.userId, text: 'Hi James! Congratulations on the upcoming milestone! Dietary requirements are absolutely no problem — we handle complex requirements at every event and all our dishes are clearly labelled. I\'d love to put together a tailored menu proposal. Would you be free for a quick call this week to discuss the format and any preferences?', createdAt: new Date('2026-01-28T11:30:00') },
  ])
  console.log('  ✓ James ↔ Spice & Co (2 messages)')

  // Conversation 5: Sophie ↔ Perfect Day Planning (new inquiry — unanswered)
  await addMessages(c5.id, [
    { senderId: sophie.userId, text: 'Hello! We have submitted an inquiry for partial wedding planning support for our September wedding at Ashford Manor. We have most things booked (photographer, florist, DJ) but are feeling a bit overwhelmed with the coordination and would love some professional support. Is this something you can help with?', createdAt: new Date('2026-02-10T16:00:00') },
  ])
  console.log('  ✓ Sophie ↔ Perfect Day Planning (1 message, awaiting reply)')

  // ── 6. Update completedEventsCount ───────────────────────────────────────
  await prisma.vendorProfile.update({
    where: { id: bellaVista.profileId },
    data: { completedEventsCount: 47 },
  })
  await prisma.vendorProfile.update({
    where: { id: spice.profileId },
    data: { completedEventsCount: 112 },
  })
  await prisma.vendorProfile.update({
    where: { id: bloomRoom.profileId },
    data: { completedEventsCount: 83 },
  })
  await prisma.vendorProfile.update({
    where: { id: bassLine.profileId },
    data: { completedEventsCount: 800 },
  })
  await prisma.vendorProfile.update({
    where: { id: perfectDay.profileId },
    data: { completedEventsCount: 156 },
  })
  await prisma.vendorProfile.update({
    where: { id: createdVendors[5].profileId },
    data: { completedEventsCount: 62 },
  })

  // ── Done ─────────────────────────────────────────────────────────────────
  console.log('\n✅ Demo data seeded successfully!\n')
  console.log('━'.repeat(50))
  console.log('DEMO ACCOUNTS (password: DemoPass123!)')
  console.log('━'.repeat(50))
  console.log('\nVendors (log in to see vendor dashboard):')
  for (const v of VENDORS) {
    console.log(`  ${v.businessName.padEnd(28)} ${v.email}`)
  }
  console.log('\nCustomers (log in to see bookings):')
  for (const c of CUSTOMERS) {
    console.log(`  ${c.fullName.padEnd(28)} ${c.email}`)
  }
  console.log('\nAdmin:')
  console.log('  admin@eventnest.com  (existing)')
  console.log('\n  All demo accounts use password: DemoPass123!')
  console.log('\nTo remove all demo data: node scripts/clean-demo.js')
}

main()
  .catch(err => {
    console.error('\n❌ Seed failed:', err.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
