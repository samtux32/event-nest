import { z } from 'zod'

export const createReviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(1, 'Review text is required').max(5000),
  photos: z.array(z.string().url().max(2000)).max(10).optional(),
})

export const reviewReplySchema = z.object({
  text: z.string().min(1, 'Reply is required').max(2000),
})
