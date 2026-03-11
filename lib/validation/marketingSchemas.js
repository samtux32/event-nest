import { z } from 'zod'

export const waitlistSchema = z.object({
  email: z.string().email('Invalid email').max(320),
  userType: z.enum(['customer', 'vendor'], { message: 'userType must be "customer" or "vendor"' }),
  businessName: z.string().max(255).optional(),
  categories: z.array(z.string()).optional(),
  name: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
})

export const newsletterSchema = z.object({
  email: z.string().email('Invalid email').max(320),
})
