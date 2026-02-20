import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'Event Nest <notifications@eventnest.com>'

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
  return `<a href="${url}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">${text}</a>`
}

// ── Email templates ──────────────────────────────────────────

export async function sendNewInquiryEmail({ vendorEmail, vendorName, customerName, eventType, eventDate }) {
  await send({
    to: vendorEmail,
    subject: `New booking inquiry from ${customerName}`,
    html: base(`
      <h2 style="margin:0 0 8px">New Booking Inquiry</h2>
      <p style="color:#6b7280;margin:0 0 24px">You have a new inquiry on Event Nest.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">From</td><td style="padding:8px 0;font-weight:600">${customerName}</td></tr>
        ${eventType ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Event type</td><td style="padding:8px 0;font-weight:600">${eventType}</td></tr>` : ''}
        ${eventDate ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Date</td><td style="padding:8px 0;font-weight:600">${eventDate}</td></tr>` : ''}
      </table>
      ${btn('View Inquiry', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/`)}
    `),
  })
}

export async function sendQuoteReceivedEmail({ customerEmail, customerName, vendorName, quoteTitle, price }) {
  await send({
    to: customerEmail,
    subject: `New quote from ${vendorName}`,
    html: base(`
      <h2 style="margin:0 0 8px">You've received a custom quote</h2>
      <p style="color:#6b7280;margin:0 0 24px">${vendorName} has sent you a quote on Event Nest.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Quote</td><td style="padding:8px 0;font-weight:600">${quoteTitle}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Price</td><td style="padding:8px 0;font-weight:600;color:#7c3aed">£${Number(price).toLocaleString('en-GB')}</td></tr>
      </table>
      ${btn('View & Accept Quote', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/customer-messages`)}
    `),
  })
}

export async function sendBookingConfirmedEmail({ customerEmail, customerName, vendorName, eventDate }) {
  await send({
    to: customerEmail,
    subject: `Booking confirmed with ${vendorName}!`,
    html: base(`
      <h2 style="margin:0 0 8px">Your booking is confirmed 🎉</h2>
      <p style="color:#6b7280;margin:0 0 24px">${vendorName} has confirmed your booking.</p>
      ${eventDate ? `<table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Event date</td><td style="padding:8px 0;font-weight:600">${eventDate}</td></tr></table>` : ''}
      ${btn('View My Bookings', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/my-bookings`)}
    `),
  })
}

export async function sendQuoteAcceptedEmail({ vendorEmail, vendorName, customerName, quoteTitle }) {
  await send({
    to: vendorEmail,
    subject: `${customerName} accepted your quote — booking confirmed!`,
    html: base(`
      <h2 style="margin:0 0 8px">Quote accepted 🎉</h2>
      <p style="color:#6b7280;margin:0 0 24px">${customerName} accepted your quote and the booking is now confirmed.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Quote</td><td style="padding:8px 0;font-weight:600">${quoteTitle}</td></tr>
      </table>
      ${btn('View in Dashboard', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/`)}
    `),
  })
}

export async function sendQuoteDeclinedEmail({ vendorEmail, vendorName, customerName, quoteTitle }) {
  await send({
    to: vendorEmail,
    subject: `${customerName} declined your quote`,
    html: base(`
      <h2 style="margin:0 0 8px">Quote declined</h2>
      <p style="color:#6b7280;margin:0 0 24px">${customerName} has declined your quote. You can send a revised offer in the chat.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Quote</td><td style="padding:8px 0;font-weight:600">${quoteTitle}</td></tr>
      </table>
      ${btn('Open Chat', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/messages`)}
    `),
  })
}

export async function sendNewMessageEmail({ recipientEmail, recipientName, senderName, preview, conversationUrl }) {
  await send({
    to: recipientEmail,
    subject: `New message from ${senderName}`,
    html: base(`
      <h2 style="margin:0 0 8px">New message from ${senderName}</h2>
      ${preview ? `<p style="margin:0 0 24px;padding:16px;background:#f9fafb;border-radius:8px;color:#374151;font-size:14px">"${preview}"</p>` : ''}
      ${btn('Reply', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${conversationUrl}`)}
    `),
  })
}

export async function sendDateProposedEmail({ customerEmail, customerName, vendorName, proposedDate, conversationUrl }) {
  await send({
    to: customerEmail,
    subject: `${vendorName} proposed a date for your event`,
    html: base(`
      <h2 style="margin:0 0 8px">A date has been proposed</h2>
      <p style="color:#6b7280;margin:0 0 24px">${vendorName} has proposed a date for your event.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Proposed date</td><td style="padding:8px 0;font-weight:600">${proposedDate}</td></tr>
      </table>
      ${btn('Accept or Decline', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${conversationUrl}`)}
    `),
  })
}

export async function sendDateAcceptedEmail({ vendorEmail, customerName, eventDate, conversationUrl }) {
  await send({
    to: vendorEmail,
    subject: `${customerName} accepted the date — booking confirmed!`,
    html: base(`
      <h2 style="margin:0 0 8px">Date accepted 🎉</h2>
      <p style="color:#6b7280;margin:0 0 24px">${customerName} has accepted the proposed date. The booking is confirmed.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Event date</td><td style="padding:8px 0;font-weight:600">${eventDate}</td></tr>
      </table>
      ${btn('View Calendar', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/calendar`)}
    `),
  })
}
