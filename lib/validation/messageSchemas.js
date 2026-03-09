import { z } from 'zod'

export const sendMessageSchema = z.object({
  text: z.string().max(10000).optional(),
  attachmentUrl: z.string().url().max(2000).optional().nullable(),
  attachmentName: z.string().max(500).optional().nullable(),
  attachmentType: z.string().max(50).optional().nullable(),
}).refine(data => data.text?.trim() || data.attachmentUrl, {
  message: 'Message text or attachment is required',
})

export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email').max(320),
  subject: z.string().max(200).optional(),
  message: z.string().min(1, 'Message is required').max(5000),
})
