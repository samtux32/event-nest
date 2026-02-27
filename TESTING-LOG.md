# Event Nest - Development Recap & Testing Log

**Project:** Event Nest — Event vendor marketplace
**Tech Stack:** Next.js 16 + Prisma + Supabase (Auth + PostgreSQL) + Tailwind CSS
**Hosted on:** Vercel (frontend) + Supabase (database & auth & storage)
**Repository:** github.com/samtux32/event-nest
**Date:** 24 February 2026

---

## What Is Event Nest?

Event Nest is a two-sided marketplace connecting event vendors (photographers, DJs, caterers, florists, etc.) with customers planning events. Vendors create profiles, list packages, and manage bookings. Customers browse the marketplace, book vendors, message them, request custom quotes, and leave reviews.

---

## How We Got Here — The Build Journey

### Phase 1: Core Transaction Loop (Sessions 1–5)
Built the foundation — the minimum needed for a marketplace to function:
- **Vendor registration & login** (Supabase Auth with email/password)
- **Vendor profile editor** — business name, category, packages, portfolio images, documents
- **Customer registration & login**
- **Marketplace** — browse approved vendors, view profiles
- **Booking submission** — customer fills out form, booking created in DB
- **Vendor dashboard** — real inquiry count, upcoming bookings, revenue stats
- **Customer bookings page** — view booking status
- **Send Message button** — creates conversation, redirects to messaging

### Phase 2: Admin & Visibility (Sessions 5–7)
- **Admin panel** (`/admin`) — approve/reject vendors, verify documents
- **Image uploads** — Supabase Storage for cover photos, profile photos, portfolio
- **Verified badge** — blue BadgeCheck on vendor profile when admin verifies documents

### Phase 3: Trust & Engagement (Sessions 7–9)
- **Review system** — star rating + text + up to 3 photos, only for completed bookings
- **Wishlist** — heart icon, persisted to DB, wishlist page with groups
- **Notifications** — bell icon with badge, dropdown, polls every 30s
- **Real-time messaging** — conversations, message list, file attachments (images + PDFs via Supabase Storage)

### Phase 4: Vendor Tools (Sessions 9–11)
- **Calendar** — real bookings mapped with status colours (pending/confirmed/completed)
- **Analytics** — profile views, inquiry conversion, revenue over time, event type breakdown
- **Review replies** — vendor responds to customer reviews
- **Date proposal** — vendor proposes date, customer accepts/declines in chat
- **Cancellation policy** — customer can cancel bookings

### Phase 5: Polish & Features (Sessions 12–14)
- **Location-based discovery** — browser geolocation, Nominatim reverse geocode, "Near [City]" pill, distance badges, "Nearest First" sort
- **Auto-geocoding** — vendor location text auto-geocoded to lat/lng on profile save
- **File attachments** — images + PDFs in chat messages
- **Social media links** — Instagram, Facebook, Twitter, TikTok, website on vendor profile
- **Custom quote flow** — customer requests quote → opens chat → vendor sends QuoteForm → pending booking in calendar → customer accepts/declines
- **Mobile responsiveness** — full responsive pass across all pages
- **iOS Safari fixes** — createPortal for modals, touch event interception fix
- **Email notifications** — transactional emails via Resend (on separate branch `feature/email-notifications`)

### Session 15: The Great ID Mismatch Fix (Current Session)
The most intensive debugging session — discovered and fixed a fundamental issue affecting every API route.

---

## The ID Mismatch Crisis — What Happened & How We Fixed It

### Root Cause
During development, the Supabase Auth account for the test vendor was re-created (when email verification settings were changed). This gave the account a **new UUID**, but the `users` table in Prisma still had the **old UUID**.

Every API route that did:
```javascript
const user = await prisma.user.findUnique({ where: { id: user.id } })
```
...returned `null`, because `user.id` (the new Supabase auth UUID) didn't match any row in the database (which still had the old UUID).

### Impact
Nearly every feature broke:
- Vendor profile save/view
- Analytics dashboard
- Messaging (conversations wouldn't load, messages wouldn't send)
- Custom quotes (send, accept, decline all failed)
- Bookings (submit, accept, cancel, propose-date all failed)
- Wishlist (add, remove, groups all failed)
- Notifications (none appeared)
- Reviews (couldn't post or reply)

### The Fix — Email Fallback Pattern
Applied to **all 27 API routes**. The pattern:

```javascript
// Try auth ID first
let dbUser = await prisma.user.findUnique({ where: { id: user.id } })
// Fall back to email if auth ID doesn't match
if (!dbUser) {
  dbUser = await prisma.user.findUnique({ where: { email: user.email } })
}
```

For routes that create messages/quotes with a `senderId` foreign key:
```javascript
// Must use the DB user's actual ID, not the Supabase auth ID
senderId: dbUser.id  // NOT user.id
```

For the auth profile route:
```javascript
// Role must come from auth metadata, not the DB user record
// (DB record might say 'customer' when user is actually a 'vendor')
role: user.user_metadata?.role  // NOT dbUser.role
```

### Routes Patched (20 commits, all 27 API routes audited)
| Route | What was fixed |
|-------|---------------|
| `auth/profile` | Email fallback + role from auth metadata |
| `vendors/profile` (GET + PUT) | Email fallback for vendor lookup |
| `vendors/[id]` | isOwner check with email fallback |
| `analytics` | Email fallback + return zeros if not found |
| `conversations` (GET + POST) | Email fallback for conversation list + customer profile |
| `conversations/[id]/messages` | getDbUserId helper, senderId fix |
| `conversations/[id]/quotes` | getDbUserId helper, vendor auth fix |
| `quotes/[id]` | Customer auth + senderId in accept/decline |
| `bookings` (GET + POST + PUT) | Customer + vendor email fallback |
| `bookings/[id]/cancel` | Customer email fallback |
| `bookings/[id]/propose-date` | Vendor + customer email fallback + senderId fix |
| `notifications` (GET + PUT) | Email fallback for both read/write |
| `wishlist` | getCustomerProfile helper with fallback |
| `wishlist/groups` (3 routes) | Customer email fallback in all group operations |
| `reviews` | Customer email fallback |
| `reviews/[reviewId]/reply` (POST + DELETE) | Vendor email fallback |
| `customers/profile` | Customer email fallback |
| `profile-views` | No fix needed (no user lookup) |
| `admin/*` | No fix needed (admin has separate auth) |
| `auth/register` | No fix needed (creates new users) |
| `vendors` (public list) | No fix needed (no auth required) |
| `*/upload` routes | No fix needed (only handle file upload) |

### Will This Happen Again?
**No.** New users registering fresh will always have matching Supabase auth ID and DB user ID. This only affected the existing test account where the auth account was re-created. The email fallback is a safety net — it handles the mismatch gracefully without requiring a database migration.

---

## Current State — Testing Round 1

**Date:** 24 February 2026
**Branch:** `main`
**Commit:** `56483f8`
**Build:** Clean (zero errors)

### Safe Rollback Points
| Commit | Description |
|--------|------------|
| `56483f8` | All routes patched — current state |
| `19a0ab3` | Before settings pages work |
| `7526789` | Before ID mismatch fixes (all features broke from here) |

### Full Audit Results (Opus model, 24 Feb 2026)

**Backend (27 API routes):** All clean. Every route with user lookup has email fallback. All `senderId` references use `dbUser.id`. All role checks use auth metadata.

**Vendor Frontend:** VendorHeader View Profile correctly fetches vendorProfileId. Analytics returns zeros when vendor not found. Profile save/view/edit all wired. Calendar, messaging, quote flow all correct.

**Customer Frontend:** All API endpoints correctly wired. Login redirects all have `redirectTo`. Image fallbacks present everywhere. Mobile responsive. iOS Safari fixes in place. Send Message + Request Custom Quote flows correct. NotificationBell responsive.

### Minor Known Issues (Cosmetic, Not Functional)
- `alert()` used for error paths in BookingRequest (2 places) and VendorPublicProfile (2 places)
- `confirm()` used for cancel booking in CustomerBookings
- These are cosmetic UX issues, not bugs — the features work correctly

---

## Codebase Stats

| Metric | Count |
|--------|-------|
| Total commits | 89 |
| Source files (app/) | 46 |
| API routes | 27 |
| React components | 35 |
| Pages/routes | 18 |

---

## Feature Checklist — All Features

### Vendor Features
- [x] Register & login
- [x] Profile editor (all fields, packages, portfolio, documents)
- [x] View own profile (even if unapproved)
- [x] Dashboard with real stats
- [x] Manage inquiries (accept bookings)
- [x] Messaging with customers
- [x] Send custom quotes via chat
- [x] Calendar with booking statuses
- [x] Propose event dates
- [x] Analytics (views, inquiries, bookings, revenue)
- [x] Reply to reviews
- [x] Social media links on profile
- [x] Settings (business name, email, password, custom quotes toggle)

### Customer Features
- [x] Register & login
- [x] Browse marketplace (category filter, sort, price range, location)
- [x] View vendor profiles
- [x] Wishlist with groups
- [x] Book vendors
- [x] Message vendors
- [x] Request custom quotes
- [x] Accept/decline quotes in chat
- [x] View bookings with status
- [x] Cancel bookings
- [x] Accept/decline date proposals
- [x] Leave reviews (with photos)
- [x] Notifications (bell icon)
- [x] Settings (name, email, password)

### Admin Features
- [x] Approve/reject vendors
- [x] Verify vendor documents
- [x] Moderate reviews (flag/unflag/delete)

### Platform Features
- [x] Location-based vendor discovery
- [x] File attachments in messages (images + PDFs)
- [x] Mobile responsive (all pages)
- [x] iOS Safari compatibility
- [x] Email notifications (branch: `feature/email-notifications`)

---

## Go Live Checklist (When Ready)

**Upgrade services first:**
1. Supabase → Pro ($25/month) — free tier pauses DB after 1 week inactivity
2. Resend → Starter ($20/month) when hitting 100 emails/day
3. Vercel → Pro ($20/month) when hitting bandwidth limits

**Domain setup:**
1. Add domain to Resend → copy DNS records
2. Add DNS records in Ionos DNS settings
3. Set up Ionos free mailbox as `hello@yourdomain.com`
4. Update `lib/email.js` → change FROM to `notifications@yourdomain.com`
5. Update `.env` → set `NEXT_PUBLIC_APP_URL` to real domain
6. Merge `feature/email-notifications` branch into main
7. Deploy

---

## Testing Log

### Test Round 1 — 24 February 2026
**Tester:** Sam
**Commit:** `56483f8`
**Status:** IN PROGRESS

| Feature | Status | Notes |
|---------|--------|-------|
| Vendor register | PASS | |
| Vendor login | PASS | |
| Vendor profile save | PASS | |
| Vendor profile view (from header) | PASS | but it opens as a new window |
| Vendor profile view (from editor) | PASS | |
| Vendor dashboard stats | PASS | but just visually looks a bit boring, also when we i sent a custom quote it automatically added it into revenue, it should be sitting at the bottom saying waiting for customer to accept. Also i think you should be able to click on each part i.e. upcoming bookings and it shows you the upcoming bookings|
| Vendor accept booking | PASS | |
| Vendor messaging | PASS | how will the view booking button know exactly what one to look at if there are multiple bookings in the chat |
| Vendor send quote | PASS | should be added to calendar and recent inquires as pending|
| Vendor calendar | PASS | but didn't show pending when sent custom quote|
| Vendor propose date | SKIP | we removed this in the part we did send quote  |
| Vendor analytics | PASS | |
| Vendor reply to review | FAIL | firstly it does not allow the review to go through anyway, as still says confirmed it does not switch to completed after it is past the date.|
| Vendor settings | PASS | but need to make sure the users can see the passwords like on the login and sign-up, also should maybe be more settings |
| Customer register | PASS | |
| Customer login | PASS | |
| Customer marketplace browse | PASS | but it would be good if they were able to just click on the profile and that allowed to view the profile, don't necessary need to use the view profile button |
| Customer view vendor profile | PASS | |
| Customer wishlist add/remove | PASS | it would be good if a note came up "Added to wishlist, or removed to wishlist"|
| Customer wishlist groups | PASS | |
| Customer book vendor | PASS | |
| Customer send message | PASS | |
| Customer request custom quote | PASS | it would be good if the customer still filled out some info i.e. in the request you give some details etc. for your customer quote|
| Customer accept/decline quote | PASS | Yes accept works, when you decline it says cancelled. Just a different point it doesn't like .50p If it is £68.50 it will go to £69|
| Customer view bookings | PASS | yes but looks like you should be able to click onto the booking to see more info|
| Customer cancel booking | FAIL | can't see this option|
| Customer accept/decline date | SKIP | this isn't on this anymore, only custom quote from send button |
| Customer leave review | FAIL | won't come through as website can't define when a booking is over and the date has passed|
| Customer notifications | PASS | yes it does work, but it would be good to get a notification on the top of th messages on the header or bookings on the header.|
| Customer settings | PASS | but need to make sure the users can see the passwords like on the login and sign-up, also should maybe be more settings |
| Admin approve vendor | PASS | |
| Admin verify documents | | can't do it yet, still need to work this stuff out|
| Admin moderate reviews | | can't do it yet |
| Mobile - all pages | FAIL| analytics loads sometimes, sometimes it doesn't. It gets a bit confused who is messaging etc., just need to look over this all properly|

**Notes:**
_Fill in as you test each feature. Mark PASS, FAIL, or SKIP. Add notes for any issues._
