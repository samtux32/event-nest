const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ── Clean existing seed data (idempotent) ──
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.reviewReply.deleteMany()
  await prisma.review.deleteMany()
  await prisma.wishlist.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.event.deleteMany()
  await prisma.portfolioImage.deleteMany()
  await prisma.award.deleteMany()
  await prisma.document.deleteMany()
  await prisma.package.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.profileView.deleteMany()
  await prisma.vendorProfile.deleteMany()
  await prisma.customerProfile.deleteMany()
  await prisma.user.deleteMany()

  console.log('Cleaned existing data.')

  // ── Create test customer ──
  const customerUser = await prisma.user.create({
    data: {
      email: 'sarah.johnson@example.com',
      role: 'customer',
      customerProfile: {
        create: {
          fullName: 'Sarah Johnson',
          phone: '+44 7700 900001',
          avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
        },
      },
    },
    include: { customerProfile: true },
  })

  const customerUser2 = await prisma.user.create({
    data: {
      email: 'james.thompson@example.com',
      role: 'customer',
      customerProfile: {
        create: {
          fullName: 'James Thompson',
          phone: '+44 7700 900002',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
        },
      },
    },
    include: { customerProfile: true },
  })

  const customerUser3 = await prisma.user.create({
    data: {
      email: 'emily.clark@example.com',
      role: 'customer',
      customerProfile: {
        create: {
          fullName: 'Emily Clark',
          phone: '+44 7700 900003',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
        },
      },
    },
    include: { customerProfile: true },
  })

  const customers = [customerUser, customerUser2, customerUser3]
  console.log(`Created ${customers.length} test customers.`)

  // ── Vendor seed data ──
  const vendorData = [
    {
      email: 'info@silvervows.com',
      businessName: 'The Silver Vows',
      category: 'Photography',
      tagline: 'Award-winning wedding photography',
      description:
        'With over 10 years of experience capturing love stories, The Silver Vows offers timeless, elegant wedding photography. Our approach blends photojournalism with fine art, ensuring every moment — from the nervous excitement of getting ready to the joyful chaos of the dance floor — is preserved beautifully.',
      location: 'London, UK',
      responseTime: '2 hours',
      coverImageUrl: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1600',
      profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      yearsExperience: 12,
      completedEventsCount: 340,
      averageRating: 4.9,
      totalReviews: 127,
      packages: [
        {
          name: 'Essential',
          price: 800,
          duration: '6 hours',
          sortOrder: 0,
          features: ['Single photographer', '300+ edited photos', 'Online gallery', 'Print rights', '4 week delivery'],
        },
        {
          name: 'Premium',
          price: 1400,
          duration: '10 hours',
          isPopular: true,
          sortOrder: 1,
          features: [
            'Lead + second photographer',
            '600+ edited photos',
            'Online gallery',
            'Print rights',
            'Engagement session',
            'Premium USB drive',
            '3 week delivery',
          ],
        },
        {
          name: 'Luxury',
          price: 2200,
          duration: 'Full day',
          sortOrder: 2,
          features: [
            'Lead + second photographer',
            '800+ edited photos',
            'Online gallery',
            'Print rights',
            'Engagement session',
            'Wedding album (30 pages)',
            'Premium USB drive',
            'Drone coverage',
            '2 week delivery',
          ],
        },
      ],
      portfolioImages: [
        { imageUrl: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800', caption: 'Bride and groom sunset', sortOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', caption: 'First look', sortOrder: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800', caption: 'Wedding details', sortOrder: 2 },
        { imageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800', caption: 'Ceremony moment', sortOrder: 3 },
        { imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800', caption: 'Reception dance', sortOrder: 4 },
      ],
      awards: [
        { title: 'UK Wedding Photographer of the Year', year: 2025 },
        { title: 'Fearless Photographers Award', year: 2024 },
        { title: 'Best of British Weddings', year: 2023 },
      ],
    },
    {
      email: 'hello@bellafiori.com',
      businessName: 'Bella Fiori',
      category: 'Florist',
      tagline: 'Stunning floral arrangements for your special day',
      description:
        'Bella Fiori creates breathtaking floral designs that transform any venue into a botanical paradise. From romantic garden-style bouquets to dramatic cascading centrepieces, our award-winning team brings your floral vision to life with sustainably sourced blooms.',
      location: 'Manchester, UK',
      responseTime: '4 hours',
      coverImageUrl: 'https://images.unsplash.com/photo-1487070183336-b863922373d4?w=1600',
      profileImageUrl: 'https://images.unsplash.com/photo-1487070183336-b863922373d4?w=400',
      yearsExperience: 8,
      completedEventsCount: 215,
      averageRating: 4.8,
      totalReviews: 89,
      packages: [
        {
          name: 'Classic',
          price: 500,
          duration: 'Per event',
          sortOrder: 0,
          features: ['Bridal bouquet', '4 bridesmaid bouquets', '6 buttonholes', 'Table runner (top table)', 'Free consultation'],
        },
        {
          name: 'Premium',
          price: 1200,
          duration: 'Per event',
          isPopular: true,
          sortOrder: 1,
          features: [
            'Bridal bouquet',
            '6 bridesmaid bouquets',
            '8 buttonholes',
            '10 table centrepieces',
            'Ceremony arch florals',
            'Top table arrangement',
            'Free consultation',
          ],
        },
        {
          name: 'Luxury',
          price: 2500,
          duration: 'Per event',
          sortOrder: 2,
          features: [
            'Bridal bouquet (premium blooms)',
            '8 bridesmaid bouquets',
            '10 buttonholes',
            '15 table centrepieces',
            'Ceremony arch florals',
            'Aisle petals',
            'Venue entrance arrangement',
            'Cake flowers',
            'Full venue styling',
          ],
        },
      ],
      portfolioImages: [
        { imageUrl: 'https://images.unsplash.com/photo-1487070183336-b863922373d4?w=800', caption: 'Bridal bouquet', sortOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800', caption: 'Table centrepiece', sortOrder: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1525258946800-98cbbe049c5e?w=800', caption: 'Ceremony arch', sortOrder: 2 },
        { imageUrl: 'https://images.unsplash.com/photo-1561128290-006dc4827214?w=800', caption: 'Autumn arrangement', sortOrder: 3 },
      ],
      awards: [
        { title: 'Best Florist - Wedding Industry Awards', year: 2025 },
        { title: 'Sustainable Floristry Award', year: 2024 },
      ],
    },
    {
      email: 'bookings@gourmetevents.com',
      businessName: 'Gourmet Events Catering',
      category: 'Catering',
      tagline: 'Fine dining for your special day',
      description:
        'Gourmet Events Catering delivers restaurant-quality food at scale. Our award-winning chefs create bespoke menus using locally sourced, seasonal ingredients. From elegant canapes to full sit-down dinners, we handle everything so you can enjoy every bite.',
      location: 'Birmingham, UK',
      responseTime: '3 hours',
      coverImageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=1600',
      profileImageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400',
      pricingModel: 'per_head',
      pricePerHead: 45,
      yearsExperience: 15,
      completedEventsCount: 520,
      averageRating: 5.0,
      totalReviews: 203,
      packages: [
        {
          name: 'Silver',
          price: 45,
          duration: 'Per head',
          sortOrder: 0,
          features: ['3-course meal', 'Welcome drink', 'Table linen', 'Crockery & cutlery', 'Waiting staff'],
        },
        {
          name: 'Gold',
          price: 75,
          duration: 'Per head',
          isPopular: true,
          sortOrder: 1,
          features: [
            '4-course meal',
            'Welcome drinks (2)',
            'Canape reception (4 varieties)',
            'Premium table linen',
            'Crockery & cutlery',
            'Dedicated event manager',
            'Waiting staff',
          ],
        },
        {
          name: 'Platinum',
          price: 120,
          duration: 'Per head',
          sortOrder: 2,
          features: [
            '5-course tasting menu',
            'Cocktail hour',
            'Canape reception (8 varieties)',
            'Premium everything',
            'Late night food station',
            'Dedicated event manager',
            'Full bar service',
            'Chef appearance',
          ],
        },
      ],
      portfolioImages: [
        { imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800', caption: 'Plated starter', sortOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', caption: 'Main course', sortOrder: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1530062845289-9109b2c9c868?w=800', caption: 'Canape selection', sortOrder: 2 },
      ],
      awards: [
        { title: 'Best Wedding Caterer - Midlands', year: 2025 },
        { title: 'Good Food Awards - Gold', year: 2024 },
        { title: 'Sustainable Catering Award', year: 2023 },
      ],
    },
    {
      email: 'studio@cinematicweddings.com',
      businessName: 'Cinematic Weddings',
      category: 'Videography',
      tagline: 'Cinematic wedding films that tell your story',
      description:
        'We create stunning wedding films that transport you back to your special day. Using cinema-grade cameras and creative storytelling techniques, every film is a unique masterpiece. From emotional highlights to feature-length documentaries, we capture the essence of your love story.',
      location: 'London, UK',
      responseTime: '2 hours',
      coverImageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600',
      profileImageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400',
      yearsExperience: 9,
      completedEventsCount: 280,
      averageRating: 4.9,
      totalReviews: 156,
      packages: [
        {
          name: 'Highlights',
          price: 1200,
          duration: '8 hours',
          sortOrder: 0,
          features: ['Single videographer', '3-5 min highlight film', 'Ceremony edit', 'Online delivery', '6 week delivery'],
        },
        {
          name: 'Feature',
          price: 2200,
          duration: '12 hours',
          isPopular: true,
          sortOrder: 1,
          features: [
            'Two videographers',
            '5-8 min highlight film',
            'Full ceremony edit',
            'Full speeches edit',
            'Drone footage',
            'Online delivery',
            '4 week delivery',
          ],
        },
        {
          name: 'Documentary',
          price: 3500,
          duration: 'Full day',
          sortOrder: 2,
          features: [
            'Two videographers',
            '8-12 min cinematic film',
            'Full ceremony edit',
            'Full speeches edit',
            'Full first dance edit',
            'Drone footage',
            'Same-day edit (5 min)',
            'USB delivery + online',
            '3 week delivery',
          ],
        },
      ],
      portfolioImages: [
        { imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800', caption: 'Behind the scenes', sortOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800', caption: 'Film still', sortOrder: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800', caption: 'Ceremony coverage', sortOrder: 2 },
        { imageUrl: 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=800', caption: 'Drone shot', sortOrder: 3 },
      ],
      awards: [
        { title: 'BAFTA Wedding Film Nominee', year: 2025 },
        { title: 'Vimeo Staff Pick', year: 2024 },
      ],
    },
    {
      email: 'bookings@djmarcus.com',
      businessName: 'DJ Marcus',
      category: 'DJ',
      tagline: 'Keep your guests dancing all night',
      description:
        'With an infectious energy and an ear for reading the room, DJ Marcus has been rocking dance floors across the UK for over 7 years. Specialising in weddings and corporate events, he blends classic hits with modern bangers to keep every generation on their feet.',
      location: 'Leeds, UK',
      responseTime: '1 hour',
      coverImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600',
      profileImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
      yearsExperience: 7,
      completedEventsCount: 410,
      averageRating: 4.7,
      totalReviews: 94,
      packages: [
        {
          name: 'Evening',
          price: 400,
          duration: '4 hours',
          sortOrder: 0,
          features: ['Professional DJ setup', 'Sound system', 'Dance floor lighting', 'Playlist consultation', '4 hours of music'],
        },
        {
          name: 'Full Day',
          price: 750,
          duration: '8 hours',
          isPopular: true,
          sortOrder: 1,
          features: [
            'Ceremony music',
            'Drinks reception background music',
            'Wedding breakfast background music',
            'Evening DJ set',
            'Professional lighting rig',
            'Wireless microphone for speeches',
          ],
        },
        {
          name: 'Premium',
          price: 1200,
          duration: '10 hours',
          sortOrder: 2,
          features: [
            'Everything in Full Day',
            'Uplighting package (12 lights)',
            'Starlit dance floor',
            'Smoke machine',
            'Photo booth add-on',
            'Dedicated MC services',
          ],
        },
      ],
      portfolioImages: [
        { imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800', caption: 'Live set', sortOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800', caption: 'Dance floor', sortOrder: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800', caption: 'Lighting setup', sortOrder: 2 },
      ],
      awards: [{ title: 'Best Wedding DJ - Yorkshire', year: 2025 }],
    },
    {
      email: 'orders@sweetdreamscakes.com',
      businessName: 'Sweet Dreams Cakes',
      category: 'Cake',
      tagline: 'Bespoke wedding cakes that taste as good as they look',
      description:
        'Sweet Dreams creates show-stopping wedding cakes that are true works of art. Every cake is handcrafted from scratch using the finest ingredients. From classic tiered elegance to modern minimalist designs, we work closely with each couple to create their dream cake.',
      location: 'Bristol, UK',
      responseTime: '6 hours',
      coverImageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e5e211b0?w=1600',
      profileImageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e5e211b0?w=400',
      yearsExperience: 11,
      completedEventsCount: 380,
      averageRating: 5.0,
      totalReviews: 178,
      packages: [
        {
          name: 'Classic',
          price: 350,
          duration: 'Per cake',
          sortOrder: 0,
          features: ['2-tier cake', 'Choice of 3 flavours', 'Buttercream finish', 'Fresh flower topper', 'Delivery & setup'],
        },
        {
          name: 'Signature',
          price: 650,
          duration: 'Per cake',
          isPopular: true,
          sortOrder: 1,
          features: [
            '3-tier cake',
            'Choice of 5 flavours',
            'Fondant or buttercream',
            'Custom design consultation',
            'Sugar flower decorations',
            'Delivery & setup',
            'Complimentary tasting',
          ],
        },
        {
          name: 'Showstopper',
          price: 1200,
          duration: 'Per cake',
          sortOrder: 2,
          features: [
            '4-5 tier cake',
            'Unlimited flavour choices',
            'Full bespoke design',
            'Hand-crafted sugar flowers',
            'Gold leaf / hand-painted details',
            'Dessert table styling',
            'Delivery, setup & cutting service',
          ],
        },
      ],
      portfolioImages: [
        { imageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e5e211b0?w=800', caption: 'Wedding cake', sortOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800', caption: 'Tiered elegance', sortOrder: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=800', caption: 'Floral cake', sortOrder: 2 },
        { imageUrl: 'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=800', caption: 'Minimalist design', sortOrder: 3 },
      ],
      awards: [
        { title: 'Cake International Gold', year: 2025 },
        { title: 'Best Wedding Cake - South West', year: 2024 },
      ],
    },
    {
      email: 'events@grandballroom.com',
      businessName: 'The Grand Ballroom',
      category: 'Venue',
      tagline: 'Elegant venue for up to 200 guests',
      description:
        'The Grand Ballroom is a stunning Georgian venue in the heart of London. With soaring ceilings, crystal chandeliers, and a private courtyard garden, it provides a breathtaking backdrop for weddings and events. Our dedicated events team ensures every detail is perfect.',
      location: 'London, UK',
      responseTime: '4 hours',
      coverImageUrl: 'https://images.unsplash.com/photo-1519167758481-83f29da8c6b7?w=1600',
      profileImageUrl: 'https://images.unsplash.com/photo-1519167758481-83f29da8c6b7?w=400',
      yearsExperience: 20,
      completedEventsCount: 850,
      averageRating: 4.9,
      totalReviews: 267,
      packages: [
        {
          name: 'Ceremony Only',
          price: 3000,
          duration: '4 hours',
          sortOrder: 0,
          features: ['Main ballroom (4 hrs)', 'Chairs for 200 guests', 'PA system', 'Bridal suite', 'On-site coordinator'],
        },
        {
          name: 'Full Day',
          price: 6000,
          duration: '12 hours',
          isPopular: true,
          sortOrder: 1,
          features: [
            'Main ballroom (12 hrs)',
            'Courtyard garden access',
            'Tables & chairs for 200',
            'Bridal suite & groom\'s room',
            'PA system & microphones',
            'On-site coordinator',
            'Complimentary parking (50 cars)',
          ],
        },
        {
          name: 'Weekend',
          price: 12000,
          duration: '2 days',
          sortOrder: 2,
          features: [
            'Exclusive venue hire (2 days)',
            'Friday evening rehearsal dinner',
            'Saturday full day wedding',
            'All indoor & outdoor spaces',
            'Full coordination team',
            'Overnight accommodation (bridal suite)',
            'Sunday brunch setup',
          ],
        },
      ],
      portfolioImages: [
        { imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f29da8c6b7?w=800', caption: 'Main ballroom', sortOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800', caption: 'Reception setup', sortOrder: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=800', caption: 'Courtyard garden', sortOrder: 2 },
        { imageUrl: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800', caption: 'Evening lighting', sortOrder: 3 },
        { imageUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800', caption: 'Table settings', sortOrder: 4 },
      ],
      awards: [
        { title: 'Best Wedding Venue - London', year: 2025 },
        { title: 'Heritage Venue of the Year', year: 2024 },
        { title: 'Condé Nast Top 50 UK Venues', year: 2023 },
      ],
    },
    {
      email: 'hello@stylegracedecore.com',
      businessName: 'Style & Grace Decor',
      category: 'Decorator/Stylist',
      tagline: 'Transform your venue into something magical',
      description:
        'Style & Grace Decor specialises in creating breathtaking event spaces. From romantic fairy-light canopies to opulent floral installations, our team transforms any venue into your dream setting. We work with you from initial mood boards through to on-the-day styling.',
      location: 'Manchester, UK',
      responseTime: '3 hours',
      coverImageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600',
      profileImageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400',
      yearsExperience: 6,
      completedEventsCount: 190,
      averageRating: 4.8,
      totalReviews: 112,
      packages: [
        {
          name: 'Essentials',
          price: 600,
          duration: 'Per event',
          sortOrder: 0,
          features: ['Table styling (up to 10 tables)', 'Top table decoration', 'Centrepieces', 'Table plan display', 'Setup & breakdown'],
        },
        {
          name: 'Transform',
          price: 1500,
          duration: 'Per event',
          isPopular: true,
          sortOrder: 1,
          features: [
            'Full venue styling',
            'Ceiling draping',
            'Fairy light canopy',
            'Centrepieces (up to 20 tables)',
            'Ceremony area styling',
            'Photo backdrop',
            'Setup & breakdown',
          ],
        },
        {
          name: 'Luxe',
          price: 3500,
          duration: 'Per event',
          sortOrder: 2,
          features: [
            'Complete venue transformation',
            'Bespoke design consultation',
            'Premium ceiling installations',
            'Floral installations',
            'Neon sign hire',
            'Lounge furniture',
            'Uplighting package',
            'On-the-day stylist',
            'Setup & breakdown',
          ],
        },
      ],
      portfolioImages: [
        { imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800', caption: 'Venue transformation', sortOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800', caption: 'Fairy light canopy', sortOrder: 1 },
        { imageUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800', caption: 'Table styling', sortOrder: 2 },
      ],
      awards: [
        { title: 'Best Stylist - North West Wedding Awards', year: 2025 },
      ],
    },
  ]

  // Reviewer text templates
  const reviewTexts = [
    'Absolutely incredible! They exceeded all our expectations and made our day truly special.',
    'We are so grateful we booked them. Professional, creative, and an absolute joy to work with.',
    'Cannot recommend highly enough! They understood our vision perfectly and delivered beyond what we imagined.',
    'From start to finish, the experience was faultless. Worth every penny.',
    'Our guests are still talking about how amazing everything was. Thank you so much!',
    'So professional and talented. They made us feel completely at ease throughout the whole process.',
    'The quality was outstanding. We will treasure the memories they helped create forever.',
    'They went above and beyond what we expected. Truly world-class service.',
  ]

  // ── Create vendors, packages, portfolio, awards, bookings, and reviews ──
  for (const vd of vendorData) {
    // Create vendor user + profile
    const vendorUser = await prisma.user.create({
      data: {
        email: vd.email,
        role: 'vendor',
        vendorProfile: {
          create: {
            businessName: vd.businessName,
            category: vd.category,
            tagline: vd.tagline,
            description: vd.description,
            location: vd.location,
            responseTime: vd.responseTime,
            coverImageUrl: vd.coverImageUrl,
            profileImageUrl: vd.profileImageUrl,
            pricingModel: vd.pricingModel || 'per_day',
            pricePerHead: vd.pricePerHead || null,
            yearsExperience: vd.yearsExperience,
            completedEventsCount: vd.completedEventsCount,
            averageRating: vd.averageRating,
            totalReviews: vd.totalReviews,
            isApproved: true,
            isAvailable: true,
            profileCompletion: 100,
          },
        },
      },
      include: { vendorProfile: true },
    })

    const vendorProfileId = vendorUser.vendorProfile.id

    // Create packages
    for (const pkg of vd.packages) {
      await prisma.package.create({
        data: {
          vendorId: vendorProfileId,
          name: pkg.name,
          price: pkg.price,
          duration: pkg.duration,
          isPopular: pkg.isPopular || false,
          sortOrder: pkg.sortOrder,
          features: pkg.features,
        },
      })
    }

    // Create portfolio images
    for (const img of vd.portfolioImages) {
      await prisma.portfolioImage.create({
        data: {
          vendorId: vendorProfileId,
          imageUrl: img.imageUrl,
          caption: img.caption,
          sortOrder: img.sortOrder,
        },
      })
    }

    // Create awards
    for (const award of vd.awards) {
      await prisma.award.create({
        data: {
          vendorId: vendorProfileId,
          title: award.title,
          year: award.year,
        },
      })
    }

    // Create bookings and reviews (3-5 per vendor)
    const numReviews = 3 + Math.floor(Math.random() * 3) // 3-5
    for (let i = 0; i < numReviews; i++) {
      const customer = customers[i % customers.length]
      const rating = 4 + Math.floor(Math.random() * 2) // 4 or 5
      const monthsAgo = i * 2 + 1
      const eventDate = new Date()
      eventDate.setMonth(eventDate.getMonth() - monthsAgo)

      const booking = await prisma.booking.create({
        data: {
          vendorId: vendorProfileId,
          customerId: customer.customerProfile.id,
          eventDate: eventDate,
          eventType: 'Wedding',
          guestCount: 100 + Math.floor(Math.random() * 100),
          status: 'completed',
          contactName: customer.customerProfile.fullName,
          contactEmail: customer.email,
        },
      })

      await prisma.review.create({
        data: {
          vendorId: vendorProfileId,
          customerId: customer.customerProfile.id,
          bookingId: booking.id,
          rating,
          text: reviewTexts[(i + vendorData.indexOf(vd)) % reviewTexts.length],
          eventDate: eventDate.toLocaleDateString('en-GB', { month: 'long', day: 'numeric', year: 'numeric' }),
        },
      })
    }

    console.log(`Created vendor: ${vd.businessName} (${numReviews} reviews)`)
  }

  // ── Create a few conversations with messages ──
  const silverVows = await prisma.vendorProfile.findFirst({ where: { businessName: 'The Silver Vows' } })
  const bellaFiori = await prisma.vendorProfile.findFirst({ where: { businessName: 'Bella Fiori' } })

  if (silverVows && bellaFiori) {
    // Conversation 1: Sarah <-> Silver Vows
    const conv1 = await prisma.conversation.create({
      data: {
        vendorId: silverVows.id,
        customerId: customerUser.customerProfile.id,
        lastMessageAt: new Date(),
        unreadVendor: 1,
        unreadCustomer: 0,
      },
    })

    const silverVowsUserId = silverVows.userId
    await prisma.message.createMany({
      data: [
        {
          conversationId: conv1.id,
          senderId: customerUser.id,
          text: "Hi! We saw your profile and absolutely love your work. We're getting married on October 12th, 2026 and would love to discuss your Premium package.",
          createdAt: new Date(Date.now() - 3600000 * 2),
        },
        {
          conversationId: conv1.id,
          senderId: silverVowsUserId,
          text: "Thank you so much! Congratulations on your upcoming wedding! I'd be delighted to be part of your special day. The Premium package includes 10 hours of coverage with a second photographer, which is perfect for capturing the full story of your day.",
          createdAt: new Date(Date.now() - 3600000 * 1.5),
        },
        {
          conversationId: conv1.id,
          senderId: silverVowsUserId,
          text: "Could you tell me a bit more about your wedding? Where's the venue and what time is the ceremony?",
          createdAt: new Date(Date.now() - 3600000 * 1.5),
        },
        {
          conversationId: conv1.id,
          senderId: customerUser.id,
          text: "We're having the ceremony at St. Mary's Church at 2 PM, followed by a reception at The Grand Ballroom from 5 PM onwards. We're expecting about 150 guests.",
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          conversationId: conv1.id,
          senderId: silverVowsUserId,
          text: "That sounds wonderful! I'd love to arrange a consultation to discuss the details. When are you free this week?",
          createdAt: new Date(Date.now() - 1800000),
        },
      ],
    })

    // Conversation 2: Sarah <-> Bella Fiori
    const conv2 = await prisma.conversation.create({
      data: {
        vendorId: bellaFiori.id,
        customerId: customerUser.customerProfile.id,
        lastMessageAt: new Date(Date.now() - 7200000),
        unreadVendor: 0,
        unreadCustomer: 1,
      },
    })

    const bellaFioriUserId = bellaFiori.userId
    await prisma.message.createMany({
      data: [
        {
          conversationId: conv2.id,
          senderId: customerUser.id,
          text: "Hello! We're planning our wedding for October and love your autumn arrangements. Do you have availability?",
          createdAt: new Date(Date.now() - 7200000 * 2),
        },
        {
          conversationId: conv2.id,
          senderId: bellaFioriUserId,
          text: "Hi Sarah! We'd love to help with your wedding flowers. October is a beautiful time for autumn-inspired arrangements. We have availability and would love to set up a consultation. What style are you envisioning?",
          createdAt: new Date(Date.now() - 7200000),
        },
      ],
    })

    console.log('Created seed conversations with messages.')
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
