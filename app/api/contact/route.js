import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/sanitize';
import { contactFormSchema } from '@/lib/validation/messageSchemas';
import { validateBody } from '@/lib/validation/helpers';

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple in-memory rate limit (resets on deploy/restart — sufficient for contact form)
const rateLimit = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60_000; // 1 minute
  const maxRequests = 3;

  const entry = rateLimit.get(ip) || [];
  const recent = entry.filter((t) => now - t < windowMs);
  if (recent.length >= maxRequests) return true;
  recent.push(now);
  rateLimit.set(ip, recent);
  return false;
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again in a minute.' }, { status: 429 });
    }

    const { data, response: validationError } = await validateBody(request, contactFormSchema);
    if (validationError) return validationError;

    const { name, email, subject, message } = data;

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service not configured.' }, { status: 500 });
    }

    await resend.emails.send({
      from: 'Event Nest <notifications@eventnestgroup.com>',
      to: 'hello@eventnestgroup.com',
      subject: `[Contact Form] ${subject || 'General'}: ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1a1a1a">
          <h2 style="color:#7c3aed;margin-bottom:16px">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Subject:</strong> ${escapeHtml(subject || 'General')}</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
          <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
        </div>
      `,
      replyTo: email,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 });
  }
}
