import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/sanitize';
import { contactFormSchema } from '@/lib/validation/messageSchemas';
import { validateBody } from '@/lib/validation/helpers';
import { rateLimit, limiters } from '@/lib/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const limited = await rateLimit(request, limiters.contact);
    if (limited) return limited;

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
