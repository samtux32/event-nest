import { Resend } from 'resend'
import { escapeHtml } from './sanitize'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'Event Nest <notifications@eventnestgroup.com>'

// Fire-and-forget helper — never throws, logs errors silently
async function send({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) return
  try {
    await resend.emails.send({ from: FROM, to, subject, html })
  } catch (err) {
    console.error('Email send error:', err?.message)
  }
}

function base(content) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1a1a1a">
      <div style="margin-bottom:24px">
        <span style="font-weight:800;font-size:18px;color:#7c3aed">Event Nest</span>
      </div>
      ${content}
      <div style="margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af">
        You're receiving this because you have an account on Event Nest.
      </div>
    </div>
  `
}

function btn(text, url) {
  return `<a href="${escapeHtml(url)}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">${escapeHtml(text)}</a>`
}

// ── Email templates ──────────────────────────────────────────

export async function sendNewInquiryEmail({ vendorEmail, vendorName, customerName, eventType, eventDate }) {
  await send({
    to: vendorEmail,
    subject: `New booking inquiry from ${escapeHtml(customerName)}`,
    html: base(`
      <h2 style="margin:0 0 8px">New Booking Inquiry</h2>
      <p style="color:#6b7280;margin:0 0 24px">You have a new inquiry on Event Nest.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">From</td><td style="padding:8px 0;font-weight:600">${escapeHtml(customerName)}</td></tr>
        ${eventType ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Event type</td><td style="padding:8px 0;font-weight:600">${escapeHtml(eventType)}</td></tr>` : ''}
        ${eventDate ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Date</td><td style="padding:8px 0;font-weight:600">${escapeHtml(eventDate)}</td></tr>` : ''}
      </table>
      ${btn('View Inquiry', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/`)}
    `),
  })
}

export async function sendQuoteReceivedEmail({ customerEmail, customerName, vendorName, quoteTitle, price }) {
  await send({
    to: customerEmail,
    subject: `New quote from ${escapeHtml(vendorName)}`,
    html: base(`
      <h2 style="margin:0 0 8px">You've received a custom quote</h2>
      <p style="color:#6b7280;margin:0 0 24px">${escapeHtml(vendorName)} has sent you a quote on Event Nest.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Quote</td><td style="padding:8px 0;font-weight:600">${escapeHtml(quoteTitle)}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Price</td><td style="padding:8px 0;font-weight:600;color:#7c3aed">£${Number(price).toLocaleString('en-GB')}</td></tr>
      </table>
      ${btn('View & Accept Quote', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/customer-messages`)}
    `),
  })
}

export async function sendBookingConfirmedEmail({ customerEmail, customerName, vendorName, eventDate }) {
  await send({
    to: customerEmail,
    subject: `Booking confirmed with ${escapeHtml(vendorName)}!`,
    html: base(`
      <h2 style="margin:0 0 8px">Your booking is confirmed 🎉</h2>
      <p style="color:#6b7280;margin:0 0 24px">${escapeHtml(vendorName)} has confirmed your booking.</p>
      ${eventDate ? `<table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Event date</td><td style="padding:8px 0;font-weight:600">${escapeHtml(eventDate)}</td></tr></table>` : ''}
      ${btn('View My Bookings', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/my-bookings`)}
    `),
  })
}

export async function sendQuoteAcceptedEmail({ vendorEmail, vendorName, customerName, quoteTitle }) {
  await send({
    to: vendorEmail,
    subject: `${escapeHtml(customerName)} accepted your quote — booking confirmed!`,
    html: base(`
      <h2 style="margin:0 0 8px">Quote accepted 🎉</h2>
      <p style="color:#6b7280;margin:0 0 24px">${escapeHtml(customerName)} accepted your quote and the booking is now confirmed.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Quote</td><td style="padding:8px 0;font-weight:600">${escapeHtml(quoteTitle)}</td></tr>
      </table>
      ${btn('View in Dashboard', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/`)}
    `),
  })
}

export async function sendQuoteDeclinedEmail({ vendorEmail, vendorName, customerName, quoteTitle }) {
  await send({
    to: vendorEmail,
    subject: `${escapeHtml(customerName)} declined your quote`,
    html: base(`
      <h2 style="margin:0 0 8px">Quote declined</h2>
      <p style="color:#6b7280;margin:0 0 24px">${escapeHtml(customerName)} has declined your quote. You can send a revised offer in the chat.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Quote</td><td style="padding:8px 0;font-weight:600">${escapeHtml(quoteTitle)}</td></tr>
      </table>
      ${btn('Open Chat', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/messages`)}
    `),
  })
}

export async function sendNewMessageEmail({ recipientEmail, recipientName, senderName, preview, conversationUrl }) {
  await send({
    to: recipientEmail,
    subject: `New message from ${escapeHtml(senderName)}`,
    html: base(`
      <h2 style="margin:0 0 8px">New message from ${escapeHtml(senderName)}</h2>
      ${preview ? `<p style="margin:0 0 24px;padding:16px;background:#f9fafb;border-radius:8px;color:#374151;font-size:14px">"${escapeHtml(preview)}"</p>` : ''}
      ${btn('Reply', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${conversationUrl}`)}
    `),
  })
}

export async function sendDateProposedEmail({ customerEmail, customerName, vendorName, proposedDate, conversationUrl }) {
  await send({
    to: customerEmail,
    subject: `${escapeHtml(vendorName)} proposed a date for your event`,
    html: base(`
      <h2 style="margin:0 0 8px">A date has been proposed</h2>
      <p style="color:#6b7280;margin:0 0 24px">${escapeHtml(vendorName)} has proposed a date for your event.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Proposed date</td><td style="padding:8px 0;font-weight:600">${escapeHtml(proposedDate)}</td></tr>
      </table>
      ${btn('Accept or Decline', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${conversationUrl}`)}
    `),
  })
}

export async function sendDateAcceptedEmail({ vendorEmail, customerName, eventDate, conversationUrl }) {
  await send({
    to: vendorEmail,
    subject: `${escapeHtml(customerName)} accepted the date — booking confirmed!`,
    html: base(`
      <h2 style="margin:0 0 8px">Date accepted 🎉</h2>
      <p style="color:#6b7280;margin:0 0 24px">${escapeHtml(customerName)} has accepted the proposed date. The booking is confirmed.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Event date</td><td style="padding:8px 0;font-weight:600">${escapeHtml(eventDate)}</td></tr>
      </table>
      ${btn('View Calendar', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/calendar`)}
    `),
  })
}

export async function sendBookingCancelledEmail({ recipientEmail, recipientName, otherPartyName, eventType, eventDate }) {
  await send({
    to: recipientEmail,
    subject: `Booking cancelled by ${escapeHtml(otherPartyName)}`,
    html: base(`
      <h2 style="margin:0 0 8px">Booking Cancelled</h2>
      <p style="color:#6b7280;margin:0 0 24px">${escapeHtml(otherPartyName)} has cancelled a booking.</p>
      <table style="width:100%;border-collapse:collapse">
        ${eventType ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Event type</td><td style="padding:8px 0;font-weight:600">${escapeHtml(eventType)}</td></tr>` : ''}
        ${eventDate ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Date</td><td style="padding:8px 0;font-weight:600">${escapeHtml(eventDate)}</td></tr>` : ''}
      </table>
      ${btn('View Bookings', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/my-bookings`)}
    `),
  })
}

export async function sendNewReviewEmail({ vendorEmail, vendorName, customerName, rating, reviewText }) {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
  await send({
    to: vendorEmail,
    subject: `New ${rating}-star review from ${escapeHtml(customerName)}`,
    html: base(`
      <h2 style="margin:0 0 8px">New Review Received</h2>
      <p style="color:#6b7280;margin:0 0 24px">${escapeHtml(customerName)} has left you a review on Event Nest.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Rating</td><td style="padding:8px 0;font-weight:600;color:#f59e0b">${stars}</td></tr>
      </table>
      ${reviewText ? `<p style="margin:16px 0;padding:16px;background:#f9fafb;border-radius:8px;color:#374151;font-size:14px">"${escapeHtml(reviewText.slice(0, 200))}${reviewText.length > 200 ? '…' : ''}"</p>` : ''}
      ${btn('View Review', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/`)}
    `),
  })
}

export async function sendVendorApprovedEmail({ vendorEmail, vendorName, profileUrl }) {
  await send({
    to: vendorEmail,
    subject: `Your Event Nest profile is live!`,
    html: base(`
      <h2 style="margin:0 0 8px">You're Approved! 🎉</h2>
      <p style="color:#6b7280;margin:0 0 24px">Great news, ${escapeHtml(vendorName)}! Your profile has been reviewed and approved. Customers can now find and book you on Event Nest.</p>
      <p style="color:#374151;margin:0 0 24px">Make sure your profile is complete with photos, packages, and a great description to attract more bookings.</p>
      ${btn('View Your Profile', profileUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/`)}
    `),
  })
}

export async function sendEventReminderEmail({ recipientEmail, recipientName, otherPartyName, eventType, eventDate, daysUntil }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  await send({
    to: recipientEmail,
    subject: `Your event with ${escapeHtml(otherPartyName)} is in ${daysUntil} days`,
    html: base(`
      <h2 style="margin:0 0 8px">Event Reminder</h2>
      <p style="color:#6b7280;margin:0 0 24px">Your upcoming event is just ${daysUntil} days away! Here are the details:</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">With</td><td style="padding:8px 0;font-weight:600">${escapeHtml(otherPartyName)}</td></tr>
        ${eventType ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Event type</td><td style="padding:8px 0;font-weight:600">${escapeHtml(eventType)}</td></tr>` : ''}
        ${eventDate ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Date</td><td style="padding:8px 0;font-weight:600">${escapeHtml(eventDate)}</td></tr>` : ''}
      </table>
      ${btn('View Booking', `${appUrl}/my-bookings`)}
    `),
  })
}

export async function sendReviewRequestEmail({ recipientEmail, recipientName, otherPartyName, eventType, eventDate, reviewUrl, isVendor }) {
  const role = isVendor ? 'customer' : 'vendor'
  await send({
    to: recipientEmail,
    subject: `Share your feedback — review ${escapeHtml(otherPartyName)} on Event Nest`,
    html: base(`
      <h2 style="margin:0 0 8px">How was your experience?</h2>
      <p style="color:#6b7280;margin:0 0 24px">We'd love to hear your feedback about ${escapeHtml(otherPartyName)}. Your review helps them improve and helps other customers make informed decisions.</p>
      <table style="width:100%;border-collapse:collapse">
        ${eventType ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Event type</td><td style="padding:8px 0;font-weight:600">${escapeHtml(eventType)}</td></tr>` : ''}
        ${eventDate ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Date</td><td style="padding:8px 0;font-weight:600">${escapeHtml(eventDate)}</td></tr>` : ''}
      </table>
      ${btn('Leave a Review', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${reviewUrl}`)}
    `),
  })
}

// ── Welcome Email (sent after registration) ───────────────────────

export async function sendWelcomeEmail({ recipientEmail, recipientName, isVendor }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  await send({
    to: recipientEmail,
    subject: `Welcome to Event Nest${isVendor ? ' — set up your profile' : ''}!`,
    html: base(`
      <h2 style="margin:0 0 8px">Welcome${recipientName ? `, ${escapeHtml(recipientName)}` : ''}!</h2>
      <p style="color:#6b7280;margin:0 0 24px">${
        isVendor
          ? 'Your vendor account has been created. Complete your profile to start receiving bookings from customers.'
          : 'Your account has been created. Start browsing vendors and planning your perfect event.'
      }</p>
      ${btn(isVendor ? 'Complete Your Profile' : 'Browse Vendors', `${appUrl}${isVendor ? '/profile-editor' : '/marketplace'}`)}
    `),
  })
}

// ── Admin Notifications ───────────────────────────────────────────

const ADMIN_EMAIL = 'hello@eventnestgroup.com'

export async function sendAdminNewVendorEmail({ vendorName, vendorEmail, categories }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  await send({
    to: ADMIN_EMAIL,
    subject: `New vendor signup: ${escapeHtml(vendorName)}`,
    html: base(`
      <h2 style="margin:0 0 8px">New Vendor Registration</h2>
      <p style="color:#6b7280;margin:0 0 24px">A new vendor has signed up and needs approval.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Business</td><td style="padding:8px 0;font-weight:600">${escapeHtml(vendorName)}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Email</td><td style="padding:8px 0;font-weight:600">${escapeHtml(vendorEmail)}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Categories</td><td style="padding:8px 0;font-weight:600">${escapeHtml((categories || []).join(', '))}</td></tr>
      </table>
      ${btn('Review in Admin', `${appUrl}/admin`)}
    `),
  })
}

// ── Profile Completion Nudge ──────────────────────────────────────

export async function sendProfileNudgeEmail({ vendorEmail, vendorName, profileCompletion }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const missing = []
  if (!profileCompletion?.hasDescription) missing.push('a description')
  if (!profileCompletion?.hasImage) missing.push('a profile photo')
  if (!profileCompletion?.hasPackages) missing.push('at least one package')
  if (!profileCompletion?.hasLocation) missing.push('your location')

  const missingText = missing.length > 0
    ? `You're still missing ${missing.join(', ')}.`
    : 'Your profile could use more detail to attract customers.'

  await send({
    to: vendorEmail,
    subject: 'Complete your Event Nest profile to start getting bookings',
    html: base(`
      <h2 style="margin:0 0 8px">Your profile needs finishing touches</h2>
      <p style="color:#6b7280;margin:0 0 24px">Hi ${escapeHtml(vendorName || 'there')}, vendors with complete profiles get significantly more inquiries.</p>
      <p style="color:#374151;margin:0 0 24px">${missingText}</p>
      <p style="color:#6b7280;margin:0 0 24px">A complete profile with photos, packages, and a great description helps customers trust you and book with confidence.</p>
      ${btn('Complete Your Profile', `${appUrl}/profile-editor`)}
    `),
  })
}

// ── Account Deleted Confirmation ──────────────────────────────────

export async function sendAccountDeletedEmail({ recipientEmail, recipientName }) {
  await send({
    to: recipientEmail,
    subject: 'Your Event Nest account has been deleted',
    html: base(`
      <h2 style="margin:0 0 8px">Account deleted</h2>
      <p style="color:#6b7280;margin:0 0 24px">Hi${recipientName ? ` ${escapeHtml(recipientName)}` : ''}, your Event Nest account and all associated data have been permanently deleted. We're sorry to see you go.</p>
      <p style="color:#6b7280;margin:0">If you didn't request this, please contact us immediately.</p>
    `),
  })
}
