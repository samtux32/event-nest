import { z } from 'zod'

export const registerSchema = z.object({
  role: z.enum(['customer', 'vendor']),
  fullName: z.string().max(200).optional(),
  businessName: z.string().max(200).optional(),
  categories: z.array(z.string().max(100)).max(15).optional(),
  category: z.string().max(100).optional(),
  userId: z.string().uuid().optional(),
  userEmail: z.string().email().optional(),
  ref: z.string().max(100).optional(),
})
