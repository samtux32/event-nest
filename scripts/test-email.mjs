import { config } from 'dotenv'
import { Resend } from 'resend'

config()

const resend = new Resend(process.env.RESEND_API_KEY)

const to = process.argv[2]
if (!to) {
  console.error('Usage: node scripts/test-email.mjs <recipient-email>')
  process.exit(1)
}

const { data, error } = await resend.emails.send({
  from: 'Event Nest <onboarding@resend.dev>',
  to,
  subject: 'New message from Flash Photography',
  html: `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1a1a1a">
      <div style="margin-bottom:24px">
        <span style="font-weight:800;font-size:18px;color:#7c3aed">Event Nest</span>
      </div>
      <h2 style="margin:0 0 8px">New message from Flash Photography</h2>
      <p style="margin:0 0 24px;padding:16px;background:#f9fafb;border-radius:8px;color:#374151;font-size:14px">"Hi! I'd love to discuss your event further. When are you available for a call?"</p>
      <a href="http://localhost:3000/customer-messages" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">Reply</a>
      <div style="margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af">
        You're receiving this because you have an account on Event Nest.
      </div>
    </div>
  `,
})

if (error) {
  console.error('Failed:', error)
} else {
  console.log('Sent! ID:', data.id)
}
