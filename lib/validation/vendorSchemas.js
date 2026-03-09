import { z } from 'zod'

const packageSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.union([z.string(), z.number()]),
  details: z.string().max(5000).optional(),
  duration: z.string().max(200).optional(),
  isPopular: z.boolean().optional(),
})

const portfolioImageSchema = z.object({
  url: z.string().url().max(2000),
  caption: z.string().max(500).optional().nullable(),
})

const documentSchema = z.object({
  url: z.string().url().max(2000),
  name: z.string().max(500).optional(),
  type: z.string().max(50).optional(),
  size: z.number().optional(),
})

export const updateVendorProfileSchema = z.object({
  businessName: z.string().min(1).max(200).optional(),
  categories: z.array(z.string().max(100)).max(15).optional(),
  description: z.string().max(10000).optional().nullable(),
  tagline: z.string().max(500).optional().nullable(),
  location: z.string().max(500).optional().nullable(),
  responseTime: z.string().max(100).optional().nullable(),
  pricingModel: z.enum(['perDay', 'perHead', 'both']).optional(),
  pricePerDay: z.union([z.string(), z.number()]).optional().nullable(),
  pricePerHead: z.union([z.string(), z.number()]).optional().nullable(),
  customQuotes: z.boolean().optional(),
  cancellationPolicy: z.string().max(5000).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().max(320).optional().nullable(),
  website: z.string().max(2000).optional().nullable(),
  instagram: z.string().max(500).optional().nullable(),
  facebook: z.string().max(500).optional().nullable(),
  twitter: z.string().max(500).optional().nullable(),
  tiktok: z.string().max(500).optional().nullable(),
  keywords: z.array(z.string().max(100)).max(50).optional(),
  coverImageUrl: z.string().url().max(2000).optional(),
  profileImageUrl: z.string().url().max(2000).optional(),
  packages: z.array(packageSchema).max(20).optional(),
  portfolioImages: z.array(portfolioImageSchema).max(50).optional(),
  documents: z.array(documentSchema).max(20).optional(),
}).passthrough() // Allow extra fields we haven't listed

export const vendorFaqSchema = z.object({
  question: z.string().min(1, 'Question is required').max(1000),
  answer: z.string().min(1, 'Answer is required').max(5000),
})
