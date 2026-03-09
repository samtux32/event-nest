import { z } from 'zod'

export const createBookingSchema = z.object({
  vendorId: z.string().uuid(),
  packageId: z.string().uuid().optional().nullable(),
  eventDate: z.string().min(1, 'Event date is required'),
  eventType: z.string().max(200).optional(),
  guestCount: z.number().int().min(0).max(100000).optional().nullable(),
  specialRequests: z.string().max(5000).optional(),
  totalPrice: z.number().min(0).optional(),
  quoteId: z.string().uuid().optional().nullable(),
})

export const updateBookingSchema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum(['confirmed', 'cancelled', 'completed']),
})

export const proposeDateSchema = z.object({
  proposedDate: z.string().min(1, 'Date is required'),
})
