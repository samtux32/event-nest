# Event Nest — Roadmap

_Last updated: March 2026_

## Done ✓
- [x] Rate limiting on all sensitive API routes (Upstash Redis)
- [x] Input validation (zod schemas across all API routes)
- [x] Input sanitization — HTML escaping in emails, file extension allowlists
- [x] SQL injection prevention — parameterized queries throughout
- [x] Push notifications (PWA/web push, VAPID)
- [x] Full-text search + filtering (price range, rating, location/distance, categories)
- [x] Vendor availability calendar (blocked dates)
- [x] Vendor approval flow (admin gate before appearing on marketplace)
- [x] Vendor verification system (badge, auto-verify on profile completion)
- [x] Admin moderation tools (vendor approval, verify, review flagging/deletion)
- [x] Admin analytics dashboard (signups, bookings, stats over time)
- [x] Pagination (messages, marketplace, bookings)
- [x] Programmatic SEO (294+ pages, JSON-LD schema markup)
- [x] Dynamic categories (only shown when vendors exist)
- [x] Recommended sort on marketplace (quality scoring)
- [x] Profile completion nudge emails (weekly cron)
- [x] Admin notification on new vendor signup
- [x] Vendor follow-up reminder (auto-email if vendor doesn't respond in 24h)
- [x] AI kill switch (AI_ENABLED env var)
- [x] Data ownership — all API routes scoped to authenticated user
- [x] Route groups (clean App Router structure)

## Critical — Revenue
- [ ] Stripe payment integration (10% vendor fee, 2% customer fee)
- [ ] Cancellation policy (flexible/moderate/strict + automatic refunds)
- [ ] Request invoice (via Stripe)
- [ ] Promoted/featured vendor listings (paid placement)

## High — Performance
- [ ] Supabase Realtime for messaging (replace polling)
- [ ] Paid geocoding API (replace Nominatim — rate limited on production)
- [ ] Image compression/optimization + CDN
- [ ] Database indexes audit for high-traffic queries

## High — UX
- [ ] Block contact info in messages until booking confirmed
- [ ] Update/cancel booking (tied to cancellation policy)
- [ ] Clickable dashboard stats with detailed breakdowns
- [ ] "Become a Vendor" option in customer settings

## Medium — Platform
- [ ] Error monitoring (Sentry)
- [ ] Automated tests for core flows (booking, messaging, auth)
- [ ] Vendor referral dashboard (track referrals + rewards)

## Later Phase
- [ ] Stripe Connect for vendor payouts
- [ ] Mobile app (Capacitor wrapper already scaffolded)
- [ ] Multi-currency (GBP + EUR)
- [ ] Scale to wider UK
