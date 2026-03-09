# Event Nest — Roadmap

_Last updated: March 2026_

## Done ✓

### Auth & Accounts
- [x] Email/password registration + login
- [x] Google OAuth
- [x] Forgot/reset password
- [x] Account deletion
- [x] Role-based routing (customer / vendor / admin)
- [x] "Become a Vendor" in customer settings
- [x] Cookie consent (GDPR)

### Vendor
- [x] Multi-section profile editor (info, photos, pricing, portfolio, documents)
- [x] Profile completion tracking + nudge emails (weekly cron)
- [x] Vendor approval flow (admin gate)
- [x] Verified badge (auto-verify on complete profile + approved)
- [x] Blocked dates / availability calendar
- [x] Promotions management
- [x] FAQs management
- [x] QR code for vendor profile
- [x] Vendor analytics dashboard (views, bookings, revenue, funnel)
- [x] Referral code generation

### Marketplace
- [x] Full-text search + multi-category filtering
- [x] Price range slider + min rating filter
- [x] Location/distance search (geolocation + Nominatim)
- [x] Recommended sort (quality scoring)
- [x] Dynamic categories (only shown when vendors exist)
- [x] Recently viewed vendors
- [x] Wishlist with event-based groups
- [x] Vendor comparison tool
- [x] Pagination (load more)
- [x] Block contact info until booking confirmed

### Booking & Quotes
- [x] Booking request flow (package selection, event details)
- [x] Booking status lifecycle (inquiry → pending → confirmed → completed)
- [x] Custom quote flow (vendor sends quote → customer accepts)
- [x] Date proposal flow
- [x] Booking cancellation
- [x] My Bookings + My Events dashboards
- [x] Auto-complete bookings cron (daily)

### Messaging
- [x] Conversations with unread counts
- [x] File attachments (images + PDFs, 10MB)
- [x] Vendor follow-up reminder cron (24h no-response, every 6 hours)

### Reviews
- [x] Star ratings + text reviews with photos
- [x] One review per completed booking
- [x] Vendor reply to reviews
- [x] Mutual reviews (vendors review customers)
- [x] Review flagging + admin moderation

### Notifications
- [x] In-app notification bell
- [x] Web Push notifications (VAPID)
- [x] Email notifications (15+ triggers via Resend)
- [x] Admin email on new vendor signup

### Customer Tools
- [x] AI event planner (Claude API) + AI kill switch
- [x] AI-generated checklists
- [x] Event checklist with timeline
- [x] Saved plans (edit/re-run)
- [x] Add to Calendar
- [x] Event reminders cron (3 days before, daily)

### Admin
- [x] Vendor approval queue
- [x] Document verification
- [x] Review moderation (flag/delete)
- [x] Analytics dashboard (signups, bookings, stats over time)

### SEO & Marketing
- [x] 294+ programmatic SEO pages
- [x] JSON-LD structured data (LocalBusiness, AggregateRating, FAQPage)
- [x] Open Graph + Twitter cards
- [x] Sitemap
- [x] GA4 (consent-gated)
- [x] Vercel Analytics + Speed Insights
- [x] 30 inspiration articles
- [x] Contact form
- [x] Vendor signup landing page

### Security & Infrastructure
- [x] Zod validation on all mutation routes
- [x] Upstash Redis rate limiting
- [x] HTML escaping in emails
- [x] File extension allowlists on uploads
- [x] SQL injection prevention
- [x] Data ownership audit (53 routes)
- [x] 4 Vercel cron jobs

---

## Still To Do

### Critical — Revenue
- [ ] **Stripe payment integration** — checkout, 10% vendor fee, 2% customer fee
- [ ] **Cancellation policy enforcement** — flexible/moderate/strict + refunds via Stripe
- [ ] **Request invoice** — via Stripe

### High — Production Readiness
- [ ] **Paid geocoding API** — replace Nominatim (rate-limited on free tier)
- [ ] **Error monitoring (Sentry)** — know when things break in production
- [ ] **Supabase upgrade to Pro** — required on launch day (free tier pauses DB)

### High — UX
- [ ] **Clickable dashboard stats** — drill into details from stat cards
- [ ] **Update booking details** — customer/vendor can edit event info post-booking

### Medium
- [ ] **Automated tests** — core flows (booking, messaging, auth)
- [ ] **Image compression + CDN** — resize on upload, faster load
- [ ] **Promoted listings** — paid placement at top of search

### Later
- [ ] **Stripe Connect** — vendor payouts
- [ ] **Multi-currency** — GBP + EUR
- [ ] **Mobile app** — Capacitor (iOS/Android, scaffolded)
- [ ] **Supabase Realtime** — replace message polling
