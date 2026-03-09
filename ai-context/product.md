# Event Nest — Product Overview

## What It Is
Event Nest is a two-sided marketplace where customers discover, compare, and book verified event vendors. It combines vendor discovery, direct messaging, custom quote negotiation, AI-powered event planning, and a verified review system in one platform.

## Platform
- **Web**: Next.js 16 app at eventnestgroup.com (responsive, mobile-first)
- **iOS**: Native app via Capacitor (wraps the web app)
- **PWA**: Service worker for push notifications, installable from browser

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Next.js 16 (App Router), Tailwind CSS 3 |
| Backend | Next.js API Routes (51 endpoints) |
| Database | PostgreSQL via Supabase (session pooler) |
| ORM | Prisma 6 |
| Auth | Supabase Auth (JWT + cookies) |
| File Storage | Supabase Storage |
| Real-time | Supabase Realtime (live chat) |
| Email | Resend (15 transactional templates) |
| Push | web-push (VAPID protocol) |
| AI | Anthropic Claude SDK |
| Analytics | GA4 (consent-gated), Vercel Analytics |
| Deployment | Vercel (serverless + cron) |

## Customer Features
- **Marketplace**: Browse vendors by category, location, price, rating. Full-text search with autocomplete.
- **AI Event Planner**: Input event details → get a full plan with budget breakdown, vendor recommendations, timeline, and checklist.
- **Booking & Quotes**: Send inquiries, receive custom quotes with itemised pricing, negotiate, confirm.
- **Messaging**: Real-time chat with vendors. File attachments, date proposals.
- **Wishlists**: Save vendors to named groups for comparison.
- **Reviews**: Rate vendors 1–5 stars with photos after completed events.
- **Calendar**: Export bookings to calendar (ICS). Event reminder notifications.
- **Checklists**: AI-generated event task lists with timeline tracking.
- **Inspiration**: 30+ planning articles at /inspiration.

## Vendor Features
- **Profile**: Business info, portfolio images, service packages, FAQs, promotions, awards, social links.
- **Booking Pipeline**: Manage inquiries → pending → confirmed → completed.
- **Custom Quotes**: Create detailed quotes with features and pricing.
- **Availability**: Block dates on calendar.
- **Analytics**: Profile views, inquiry rates, booking conversions.
- **Reviews**: Receive and respond to verified customer reviews.
- **Referral Programme**: Referral codes and QR codes for vendor-to-vendor referrals.

## Vendor Categories
Catering, Photography, Videography, Florist, DJ, Live Band, Venue, Decorator/Stylist, Cake

## Admin Features
- Vendor approval/rejection gate
- Flagged review management
- Platform-wide analytics

## Notification System
Three channels, unified through a single helper function (`createNotification()`):
1. **In-app**: Database-stored, shown via NotificationBell component
2. **Web Push**: VAPID-based, delivered via service worker
3. **Email**: Transactional emails via Resend

## Cron Jobs (Vercel)
- **Complete bookings** (2 AM UTC): Auto-mark past bookings as completed
- **Event reminders** (9 AM UTC): Notify customers 3 days before their event

## Key URLs
- `/marketplace` — public vendor browsing
- `/plan-my-event` — AI event planner
- `/vendor-signup` — vendor registration
- `/inspiration` — planning articles
- `/contact` — contact form
- `/help` — FAQ
- `/terms`, `/privacy` — legal pages
