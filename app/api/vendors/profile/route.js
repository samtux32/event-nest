import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (user.user_metadata?.role !== 'vendor') {
    return NextResponse.json({ error: 'Not a vendor' }, { status: 403 })
  }

  try {
    const body = await request.json()

    // Find vendor profile
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: user.id },
    })

    if (!vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })
    }

    // Transform pricing model: perDay -> per_day, perHead -> per_head
    const pricingModelMap = {
      perDay: 'per_day',
      perHead: 'per_head',
      both: 'both',
    }

    // Calculate profile completion
    const fields = [
      body.businessName,
      body.category,
      body.description,
      body.location,
      body.phone,
      body.email,
      body.pricePerDay || body.pricePerHead,
    ]
    const filledFields = fields.filter(Boolean).length
    const profileCompletion = Math.round((filledFields / fields.length) * 100)

    // Update vendor profile
    const updated = await prisma.vendorProfile.update({
      where: { id: vendorProfile.id },
      data: {
        businessName: body.businessName || vendorProfile.businessName,
        category: body.category || vendorProfile.category,
        description: body.description || null,
        location: body.location || null,
        responseTime: body.responseTime || null,
        pricingModel: pricingModelMap[body.pricingModel] || 'per_day',
        pricePerDay: body.pricePerDay ? parseFloat(body.pricePerDay) : null,
        pricePerHead: body.pricePerHead ? parseFloat(body.pricePerHead) : null,
        customQuotesEnabled: body.customQuotes ?? true,
        phone: body.phone || null,
        email: body.email || null,
        website: body.website || null,
        instagram: body.instagram || null,
        facebook: body.facebook || null,
        twitter: body.twitter || null,
        profileCompletion,
        ...(body.coverImageUrl ? { coverImageUrl: body.coverImageUrl } : {}),
        ...(body.profileImageUrl ? { profileImageUrl: body.profileImageUrl } : {}),
      },
    })

    // Sync portfolio images if provided
    if (Array.isArray(body.portfolioImages)) {
      await prisma.portfolioImage.deleteMany({ where: { vendorId: vendorProfile.id } })
      const portfolioToCreate = body.portfolioImages
        .filter(img => img.url)
        .map((img, index) => ({
          vendorId: vendorProfile.id,
          imageUrl: img.url,
          caption: img.caption || null,
          sortOrder: index,
        }))
      if (portfolioToCreate.length > 0) {
        await prisma.portfolioImage.createMany({ data: portfolioToCreate })
      }
    }

    // Sync documents if provided
    if (Array.isArray(body.documents)) {
      await prisma.document.deleteMany({ where: { vendorId: vendorProfile.id } })
      const docsToCreate = body.documents
        .filter(doc => doc.url)
        .map(doc => ({
          vendorId: vendorProfile.id,
          fileUrl: doc.url,
          fileName: doc.name || 'document',
          fileType: doc.type || 'FILE',
          fileSize: doc.size || 0,
        }))
      if (docsToCreate.length > 0) {
        await prisma.document.createMany({ data: docsToCreate })
      }
    }

    // Delete + recreate packages only if packages were explicitly sent
    if (Array.isArray(body.packages)) {
      await prisma.package.deleteMany({
        where: { vendorId: vendorProfile.id },
      })

      const packagesToCreate = body.packages
        .filter(pkg => pkg.name && pkg.price)
        .map((pkg, index) => ({
          vendorId: vendorProfile.id,
          name: pkg.name,
          price: parseFloat(pkg.price),
          features: pkg.details
            ? pkg.details.split('\n').map(f => f.trim()).filter(Boolean)
            : [],
          sortOrder: index,
        }))

      if (packagesToCreate.length > 0) {
        await prisma.package.createMany({ data: packagesToCreate })
      }
    }

    // Fetch updated profile with packages
    const result = await prisma.vendorProfile.findUnique({
      where: { id: vendorProfile.id },
      include: { packages: { orderBy: { sortOrder: 'asc' } } },
    })

    return NextResponse.json({ profile: result })
  } catch (err) {
    console.error('Vendor profile save error:', err)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}
