# Project Overview

## Purpose
Event Nest is a two-sided marketplace connecting event customers with professional vendors. Customers discover, compare, and book vendors for weddings, birthdays, corporate events, and more. Vendors manage their profiles, respond to inquiries, send quotes, and build reputation through reviews. An AI event planner powered by Claude helps customers plan entire events with budget breakdowns and vendor recommendations.

**Live at:** eventnestgroup.com

## Core Features

### For Customers
- **Marketplace** — browse, search, and filter vendors by category, location, price, and rating
- **AI Event Planner** — generate full event plans with budgets, timelines, and vendor suggestions
- **Booking & Quotes** — send inquiries, receive custom quotes, negotiate, and confirm bookings
- **Messaging** — real-time chat with vendors including file attachments and date proposals
- **Wishlists** — save vendors to named groups for comparison
- **Reviews** — rate and review vendors with photos after completed events
- **Calendar & Reminders** — add events to calendar, receive push/email reminders
- **Event Checklists** — AI-generated task lists with timeline tracking

### For Vendors
- **Profile Management** — business info, portfolio images, service packages, FAQs, promotions
- **Booking Pipeline** — manage inquiries through confirmation to completion
- **Custom Quotes** — create itemised quotes with features and pricing
- **Availability** — block dates, manage calendar
- **Analytics** — track profile views, inquiry rates, booking conversions
- **Referral Programme** — generate referral codes and QR codes
- **Reviews & Reputation** — respond to reviews, build verified rating

### Platform
- **Admin Dashboard** — vendor approval, flagged review management
- **Multi-channel Notifications** — in-app, Web Push, and email
- **Cron Jobs** — auto-complete past bookings, send event reminders
- **iOS App** — native wrapper via Capacitor

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Client (Browser / iOS)         │
│  React 18 Components + Tailwind CSS              │
│  Supabase Auth (JWT in cookies)                  │
│  Service Worker (Web Push)                       │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│              Next.js 16 App Router               │
│  middleware.js → auth guard + role routing        │
│                                                  │
│  app/api/*  → 51 REST endpoints                  │
│  app/*/page.js → server component pages          │
│  components/*.jsx → client components            │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│              Backend Services                    │
│                                                  │
│  Prisma ORM ──→ Supabase PostgreSQL (pooler)     │
│  Supabase Auth ──→ JWT session management        │
│  Supabase Storage ──→ file uploads               │
│  Supabase Realtime ──→ live chat                 │
│  Resend ──→ transactional email                  │
│  web-push ──→ VAPID push notifications           │
│  Anthropic SDK ──→ AI event planning             │
│  Nominatim ──→ geocoding (location search)       │
└─────────────────────────────────────────────────┘
```

**Rendering model:** Pages use server components by default. Interactive components marked with `"use client"` directive. API routes handle all data mutations.

**Auth flow:** Supabase Auth issues JWT → stored in cookies → middleware refreshes session on each request → API routes verify via `supabase.auth.getUser()` → Prisma user lookup by ID (fallback to email).

## Key Components

### `app/` — Routes & API
- `app/api/` — 51 REST API endpoints (auth, vendors, bookings, messages, reviews, cron, etc.)
- `app/marketplace/` — public vendor browsing
- `app/my-bookings/` — customer booking dashboard
- `app/messages/` — vendor messaging interface
- `app/plan-my-event/` — AI event planner page
- `app/admin/` — admin dashboard
- `app/layout.js` — root layout (AuthProvider, GA4, CookieConsent, Vercel Analytics)

### `components/` — 62 React Components
- Layout: `AppHeader`, `PublicHeader`, `AuthProvider`, `CookieConsent`
- Marketplace: `CustomerMarketplace`, `VendorPublicProfile`, `VendorCompare`
- Booking: `BookingRequest`, `QuoteForm`, `QuoteCard`, `QuoteAcceptModal`
- Messaging: `Messages`, `ConversationList`, `MessageBubble`, `DateProposalCard`
- Vendor: `VendorDashboard`, `VendorProfileEditor`, `VendorCalendar`, `VendorAnalytics`
- Customer: `CustomerBookings`, `MyEvents`, `SavedPlans`, `EventChecklist`
- AI: `AIEventPlanner`, `BudgetTracker`

### `lib/` — Shared Utilities
- `prisma.js` — Prisma client singleton (prevents hot-reload leaks)
- `notifications.js` — `createNotification()` / `createNotificationInTx()` (DB + push)
- `email.js` — 15 email templates via Resend
- `push.js` — `sendPushToUser()` with auto-cleanup of expired subscriptions
- `ics.js` — ICS calendar file generation
- `supabase/` — server, client, and middleware Supabase clients

### `prisma/`
- `schema.prisma` — 22 models, 6 enums (User, VendorProfile, CustomerProfile, Booking, Conversation, Message, Quote, Review, Wishlist, SavedPlan, Checklist, etc.)
- `seed.js` — database seeding
- `migrations/` — SQL migration history

### `scripts/` — Admin & Testing
- `seed-demo.js` / `clean-demo.js` — demo data management
- `create-admin.js` — create admin user
- `test-email.mjs` / `test-quote-flow.mjs` — manual test scripts

### `public/` — Static Assets
- `sw.js` — service worker for Web Push
- `manifest.json` — PWA manifest
- Favicons, logo, OG image

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Next.js 16 (App Router), Tailwind CSS 3 |
| Backend | Next.js API Routes (serverless) |
| Database | PostgreSQL via Supabase (session pooler) |
| ORM | Prisma 6 |
| Auth | Supabase Auth (JWT + cookies) |
| File Storage | Supabase Storage |
| Real-time | Supabase Realtime |
| Email | Resend |
| Push Notifications | web-push (VAPID) |
| AI | Anthropic Claude SDK |
| Icons | lucide-react |
| Analytics | Google Analytics 4, Vercel Analytics |
| Mobile | Capacitor (iOS) |
| Deployment | Vercel (serverless + cron) |
| Geocoding | OpenStreetMap Nominatim |

## How Everything Fits Together

1. **User visits the site** → `middleware.js` checks auth state, refreshes Supabase session cookie, enforces role-based routing (customer routes, vendor routes, admin routes, public routes).

2. **Browsing vendors** → `CustomerMarketplace` component fetches from `GET /api/vendors` with search/filter/pagination params → Prisma queries approved vendors with includes for packages, reviews, portfolio → returns paginated JSON.

3. **Booking a vendor** → Customer fills `BookingRequest` form → `POST /api/bookings` creates booking + conversation + notification → `createNotification()` fires in-app + Web Push → `sendNewInquiryEmail()` fires email (all fire-and-forget).

4. **Quote negotiation** → Vendor creates quote via `QuoteForm` → `POST /api/conversations/[id]/messages` with `type: 'quote'` → Customer sees `QuoteCard` → accepts via `QuoteAcceptModal` → `PUT /api/quotes/[id]` updates status + confirms booking.

5. **Real-time messaging** → `useRealtimeChat` hook subscribes to Supabase Realtime channel → new messages appear instantly → `POST /api/conversations/[id]/messages` sends message + push + email.

6. **AI Event Planning** → Customer fills event details in `AIEventPlanner` → `POST /api/event-planner` streams Claude response → returns budget breakdown, vendor categories, timeline, tips → can be saved to `SavedPlan`.

7. **Post-event** → `complete-bookings` cron marks past bookings as completed → `sendReviewRequestEmail()` → Customer writes review → vendor can reply → mutual review system.

8. **Notifications flow** → Every significant action calls `createNotification()` → creates DB record → fires `sendPushToUser()` (Web Push via service worker) → relevant email template sent via Resend. Three channels, one helper function.
