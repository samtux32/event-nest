# Event Nest - Product Requirements Document

**Version:** 1.0
**Date:** February 2026
**Status:** Draft

---

## 1. Product Overview

Event Nest is a two-sided marketplace that connects event service vendors (photographers, caterers, florists, DJs, etc.) with customers planning events. The platform serves as both a **discovery marketplace** for customers and a **business management system** for vendors.

**Target market:** Northern Ireland and Republic of Ireland event services industry at launch, initially focused on weddings with expansion to corporate events, birthdays, and engagements. Plans to scale to the wider UK and beyond.

**Currency:** GBP (£) and EUR

**Revenue model:** Split commission per booking - 10% vendor fee, 2% customer fee.

---

## 2. User Roles

### 2.1 Customer
A person planning an event who needs to find, compare, and book vendors.

### 2.2 Vendor
A business or individual providing event services who needs to manage their profile, inquiries, bookings, and client communications.

### 2.3 Admin (future)
Platform administrators who manage vendor approvals, document verification, disputes, and platform settings.

---

## 3. Vendor Categories

The platform supports the following vendor categories:

| Category | Example Services |
|---|---|
| Photography | Wedding photography, event photography, portraits |
| Videography | Wedding films, event videography, drone footage |
| Catering | Full-service catering, per-head pricing |
| Florist | Floral arrangements, bouquets, venue decoration |
| DJ | Music, MC services, sound equipment |
| Live Band/Music | Ceremony music, reception entertainment |
| Venue | Ballrooms, outdoor spaces, reception halls |
| Decorator/Stylist | Venue styling, table settings, theme design |
| Cake | Wedding cakes, dessert tables, bespoke cakes |
| Wedding Planner | Full/partial planning, day-of coordination |
| Hair & Makeup | Bridal styling, group bookings |
| Transport | Wedding cars, guest transport |
| Stationery | Invitations, signage, programs |
| Entertainment | Photo booths, magicians, performers |

---

## 4. Feature Specifications

### 4.1 Authentication & User Management

**Status:** Not yet built - requires full implementation.

#### 4.1.1 Registration
- Email/password registration with role selection (Customer or Vendor)
- OAuth support (Google, Apple) for customer convenience
- Email verification required before account activation
- Vendor registration collects: business name, category, location, contact info

#### 4.1.2 Login
- Email/password login
- OAuth login
- "Forgot password" flow with email reset link
- Session management with JWT or similar token-based auth

#### 4.1.3 User Profiles
- Customers: name, email, phone, profile photo, saved events
- Vendors: full business profile (see Section 4.2)

---

### 4.2 Vendor Profile & Management

#### 4.2.1 Profile Editor
Vendors manage their public-facing profile through a multi-section editor with completion tracking.

**Sections:**

1. **Business Information** (required)
   - Business name
   - Category (single-select from vendor categories)
   - Location (city, UK)
   - Description (free text, 500 character limit)
   - Typical response time (1 hour / 2 hours / same day / 24 hours / 2-3 days)

2. **Profile Photos** (required)
   - Cover photo (recommended 1600x600px)
   - Profile picture (recommended 400x400px, square)
   - Supported formats: PNG, JPG, max 10MB

3. **Pricing & Packages** (required)
   - Pricing model: Per Day / Per Head / Both
   - Starting price fields based on model
   - Custom quote toggle (allow customers to request bespoke quotes)
   - Packages (unlimited): name, price, included features/details
   - Ability to add/remove packages (minimum 1)

4. **Portfolio** (recommended, min 3 images)
   - Multi-image upload
   - Grid display
   - Delete individual images

5. **Contact & Social Media** (required: phone + email)
   - Phone number
   - Email address
   - Website URL
   - Instagram handle
   - Facebook page
   - Twitter/X handle

6. **Documents** (recommended)
   - Upload certificates, insurance docs, licenses
   - Accepted formats: PDF, JPG, PNG, max 10MB each
   - Document verification status: Pending Review / Verified / Rejected
   - Recommended: Public Liability Insurance, Professional Indemnity Insurance, Business License

**Profile Completion:**
- Each section has completion criteria (e.g., Business Info requires all 4 required fields)
- Completion percentage displayed in sidebar
- Prompt: "Profiles with all sections filled get 3x more inquiries"

#### 4.2.2 Public Vendor Profile
The customer-facing view of a vendor profile displays:

- Cover image with gradient overlay
- Profile image, business name, category, tagline
- Rating (5-star, averaged), review count
- Location, response time
- Stats: completed events count, years of experience
- Availability indicator ("Available for bookings")
- **About** section with services checklist
- **Awards & Recognition** section
- **Portfolio** image gallery (grid, hover zoom)
- **Reviews** with: reviewer name, event date, 5-star rating, text review, review date
- "View all reviews" pagination
- **Packages & Pricing** sidebar (sticky on scroll): package cards with name, price, duration, feature list, "Most Popular" badge
- CTAs: "Request Quote" button, "Send Message" button
- Wishlist (heart) and Share actions in header

---

### 4.3 Customer Marketplace

#### 4.3.1 Homepage / Discovery
- Hero section with headline and search bar
- Search bar: text search + category dropdown + filter icon
- Category filter tabs (horizontal scrollable pills)
- Sort options: Highest Rated, Price Low-High, Price High-Low, Most Reviews
- Results count display

#### 4.3.2 Vendor Cards
Each vendor is displayed as a card in a 3-column grid:
- Cover image (hover zoom effect)
- Wishlist heart button (top-right overlay)
- Vendor name, category label
- Description (1 line)
- Star rating with review count
- Location with pin icon
- Starting price
- "View Profile" CTA button

#### 4.3.3 Search & Filtering
- Text search matches against vendor name and category
- Category filter (single-select, includes "All Categories")
- Sort dropdown
- Future: price range filter, location radius, availability date filter, rating threshold

#### 4.3.4 Wishlist
- Toggle heart icon on vendor cards and profile pages
- Persist wishlist to user account
- Dedicated wishlist page (nav link exists, page not yet built)

---

### 4.4 Booking & Quote Request

#### 4.4.1 Booking Request Form
Multi-step form initiated from a vendor's profile:

1. **Package Selection**
   - Display vendor's packages as selectable cards
   - "Most Popular" badge on recommended package
   - Shows: name, price, duration, feature list

2. **Event Details**
   - Event date (date picker)
   - Event type (Wedding / Corporate Event / Birthday Party / Engagement)
   - Guest count
   - Venue name
   - Venue address
   - Start time
   - End time

3. **Additional Services**
   - Toggleable add-on services (vendor-specific)

4. **Special Requests**
   - Free-text area for notes, requirements, preferences

5. **Contact Information**
   - Full name
   - Email address
   - Phone number
   - "How did you hear about us?" field

6. **Booking Summary** (sticky sidebar)
   - Vendor info card (photo, name, category, rating, response time)
   - Selected package details
   - Price breakdown

**Submission:** Sends quote request to vendor. Confirmation message shows expected response time.

#### 4.4.2 Booking Lifecycle
Bookings progress through the following states:

```
New Inquiry -> Pending -> Confirmed -> Completed
                 |
                 v
             Cancelled
```

---

### 4.5 Messaging System

#### 4.5.1 Shared Architecture
Both vendor and customer messaging share the same component structure:

- **Conversation List** (left sidebar): search bar, conversation cards showing avatar, name, last message preview, timestamp, unread badge, online indicator
- **Chat Area** (center): chat header with contact info, scrollable message thread, message input with send button
- **Event Details Sidebar** (right): event date, event type, inquiry status, quick actions

#### 4.5.2 Vendor Messaging (`/messages`)
- Lists all customer conversations
- Each conversation shows: customer name, event date, event type, inquiry status (New/Active/Pending/Confirmed)
- Vendor header navigation

#### 4.5.3 Customer Messaging (`/customer-messages`)
- Lists all vendor conversations
- Each conversation shows: vendor name, service type, event date, inquiry status
- Customer header navigation

#### 4.5.4 Message Features
- Text messages with sender/receiver bubbles (purple for sent, white for received)
- Timestamps on each message
- Online/offline status indicators
- Unread message count badges
- Conversation search
- Future: file attachments, read receipts, typing indicators

---

### 4.6 Vendor Dashboard

#### 4.6.1 Overview (`/`)
The vendor's home screen after login:

- Welcome message with business name
- **Profile completion prompt** (dismissible): shows missing items (e.g., "Portfolio images", "Insurance document") with CTA to profile editor
- **Stat cards** (2x2 grid):
  - New Inquiries (count, "Awaiting response")
  - Upcoming Bookings (count, "Events scheduled")
  - Total Revenue (GBP, "All time earnings")
  - Completed Events (count, "Successfully delivered")
- **Recent Inquiries** list:
  - Each inquiry: client avatar/initial, name, event date, budget, status badge (New/Pending)
  - "Accept" button per inquiry (updates bookings count and revenue)
  - Click to expand inquiry details panel
  - Inquiry detail shows: message preview, "Send Message" and "Accept Booking" CTAs
- "Simulate New" button for demo purposes (to be removed in production)

#### 4.6.2 Analytics (`/analytics`)
Comprehensive analytics dashboard with time period selector (7 / 30 / 90 days):

**Key Metrics (stat cards):**
- Profile Views (with % change indicator)
- Inquiries (with % of views conversion)
- Bookings (with % conversion from inquiries)
- Revenue (with average booking value)

**Conversion Funnel:**
- Views -> Inquiries -> Quotes Sent -> Accepted -> Bookings
- Bar chart with drop-off percentages between stages

**Activity Over Time:**
- SVG line chart with 3 series: Views (purple), Inquiries (blue), Bookings (green)
- Data points with dots, gridlines, axis labels

**Inquiry Sources:**
- Horizontal bar chart: Search Results, Category Browse, Direct Link, Wishlist

**Busiest Days:**
- Ranked list of days by view count with progress bars

**Top Event Types:**
- Breakdown: Wedding, Corporate, Birthday, Other (with booking counts)

**Performance Score:**
- Average rating (out of 5, star display)
- Response rate (percentage with progress bar)
- Average response time
- Total review count

**Booking Status Overview:**
- 4-column summary: Pending, Confirmed, Completed, Cancelled (with color coding)

#### 4.6.3 Calendar (`/calendar`)
- Monthly calendar grid with navigation (prev/next month)
- Bookings displayed on their dates as color-coded pills:
  - Green = Confirmed
  - Yellow = Pending
  - Blue = Completed
- Today's date highlighted (purple border)
- **Upcoming Bookings sidebar**: scrollable list of next bookings with client name, status, date, time, price
- **Booking Detail Modal** (click on any booking):
  - Client name, status badge
  - Event type, price
  - Date & time, location
  - Client email (clickable mailto:) and phone (clickable tel:)
  - Notes section
  - "Send Message" and "View Contract" CTAs

---

### 4.7 Navigation

#### 4.7.1 Vendor Header
Persistent top navigation for vendor-side pages:
- Event Nest logo + brand name (links to dashboard)
- Nav links: Dashboard (`/`), Calendar (`/calendar`), Messages (`/messages`), Analytics (`/analytics`), Profile (`/vendor`)
- Active state: purple text + underline
- "Edit Profile" CTA button (links to `/profile-editor`)
- User avatar

#### 4.7.2 Customer Header
Persistent top navigation for customer-side pages:
- Event Nest logo + brand name
- Nav links: Discover (`/marketplace`), Inspire, My Events, Bookings, Wishlist, Messages (`/customer-messages`), Vendor Portal (`/`)
- User avatar

---

## 5. Data Model

### 5.1 Core Entities

```
User
  - id: UUID
  - email: string (unique)
  - password_hash: string
  - role: enum (customer, vendor, admin)
  - created_at: timestamp
  - updated_at: timestamp

CustomerProfile
  - id: UUID
  - user_id: FK -> User
  - full_name: string
  - phone: string
  - avatar_url: string

VendorProfile
  - id: UUID
  - user_id: FK -> User
  - business_name: string
  - category: string
  - description: text
  - location: string
  - response_time: string
  - cover_image_url: string
  - profile_image_url: string
  - pricing_model: enum (per_day, per_head, both)
  - price_per_day: decimal
  - price_per_head: decimal
  - custom_quotes_enabled: boolean
  - phone: string
  - email: string
  - website: string
  - instagram: string
  - facebook: string
  - twitter: string
  - years_experience: integer
  - completed_events_count: integer
  - is_available: boolean
  - profile_completion: integer (0-100)
  - created_at: timestamp
  - updated_at: timestamp

Package
  - id: UUID
  - vendor_id: FK -> VendorProfile
  - name: string
  - price: decimal
  - duration: string
  - is_popular: boolean
  - sort_order: integer
  - features: text[] (array of strings)

PortfolioImage
  - id: UUID
  - vendor_id: FK -> VendorProfile
  - image_url: string
  - sort_order: integer
  - uploaded_at: timestamp

Document
  - id: UUID
  - vendor_id: FK -> VendorProfile
  - file_url: string
  - file_name: string
  - file_type: string
  - file_size: integer
  - verification_status: enum (pending, verified, rejected)
  - uploaded_at: timestamp

Award
  - id: UUID
  - vendor_id: FK -> VendorProfile
  - title: string
  - year: integer

Event
  - id: UUID
  - customer_id: FK -> CustomerProfile
  - name: string (e.g., "Our Wedding", "Tom's 25th Birthday")
  - event_date: date
  - event_type: string
  - guest_count: integer
  - venue_name: string
  - venue_address: string
  - created_at: timestamp
  - updated_at: timestamp

Booking
  - id: UUID
  - event_id: FK -> Event (nullable)
  - vendor_id: FK -> VendorProfile
  - customer_id: FK -> CustomerProfile
  - package_id: FK -> Package (nullable)
  - event_date: date
  - event_type: string
  - guest_count: integer
  - venue_name: string
  - venue_address: string
  - start_time: time
  - end_time: time
  - additional_services: text[]
  - special_requests: text
  - status: enum (new, pending, confirmed, completed, cancelled)
  - total_price: decimal
  - vendor_fee: decimal (10% of total_price)
  - customer_fee: decimal (2% of total_price)
  - payment_status: enum (unpaid, paid, refunded)
  - stripe_payment_id: string (nullable)
  - confirmed_at: timestamp (nullable)
  - created_at: timestamp
  - updated_at: timestamp

Conversation
  - id: UUID
  - booking_id: FK -> Booking (nullable)
  - vendor_id: FK -> VendorProfile
  - customer_id: FK -> CustomerProfile
  - last_message_at: timestamp
  - created_at: timestamp

Message
  - id: UUID
  - conversation_id: FK -> Conversation
  - sender_id: FK -> User
  - text: text
  - is_read: boolean
  - created_at: timestamp

Review
  - id: UUID
  - vendor_id: FK -> VendorProfile
  - customer_id: FK -> CustomerProfile
  - booking_id: FK -> Booking
  - rating: integer (1-5)
  - text: text
  - event_date: string
  - created_at: timestamp

Wishlist
  - id: UUID
  - customer_id: FK -> CustomerProfile
  - vendor_id: FK -> VendorProfile
  - event_id: FK -> Event (nullable, wishlist can be per-event)
  - created_at: timestamp

ReviewReply
  - id: UUID
  - review_id: FK -> Review (unique, one reply per review)
  - vendor_id: FK -> VendorProfile
  - text: text
  - created_at: timestamp

Notification
  - id: UUID
  - user_id: FK -> User
  - type: string (e.g., new_inquiry, booking_confirmed, message_received)
  - title: string
  - body: text
  - link: string (in-app route)
  - is_read: boolean
  - channels_sent: string[] (email, sms, push)
  - created_at: timestamp
```

---

## 6. Technical Architecture

### 6.1 Current State (Prototype)
- **Framework:** Next.js 16 (canary, App Router)
- **UI:** React 18, Tailwind CSS 3.3
- **Icons:** Lucide React
- **Language:** JavaScript/JSX
- **State:** React useState (local component state, mock data only)
- **Backend:** None - all data is hardcoded in components

### 6.2 Production Stack

#### Core Framework
| Layer | Technology | Notes |
|---|---|---|
| Framework | **Next.js 15** (stable, App Router) | Downgrade from canary v16 to stable v15 for production reliability |
| Language | **TypeScript** | Migrate from JSX to TSX for type safety and better DX |
| Styling | **Tailwind CSS 3.3** | Keep as-is |
| Icons | **Lucide React** | Keep as-is |
| ORM | **Prisma** | Type-safe database queries, schema migrations, generated types from DB schema |

#### Backend Services (Supabase)
Supabase is the primary backend, providing database, auth, storage, and real-time in a single managed platform.

| Service | What it provides | Free tier limit |
|---|---|---|
| **Supabase Postgres** | Primary database | 500MB storage, 2 projects |
| **Supabase Auth** | Registration, login, OAuth (Google/Apple), email verification, password reset | Unlimited users |
| **Supabase Storage** | Image and document uploads (vendor photos, portfolio, certificates) | 1GB storage, 2GB bandwidth |
| **Supabase Realtime** | WebSocket subscriptions for messaging and in-app notifications, online/offline presence | Included |
| **Supabase Edge Functions** | Serverless functions for Stripe webhooks, email triggers, background jobs | 500K invocations/month |
| **Row Level Security (RLS)** | Database-level access control - vendors see only their data, customers see only their bookings | Built into Postgres |

**API approach:** Use the Supabase JS client (`@supabase/supabase-js`) directly from Next.js Server Components and API routes. Next.js API routes handle complex operations (Stripe webhooks, multi-step transactions). Simple CRUD uses the Supabase client directly with RLS policies for security.

#### Authentication Flow
- Supabase Auth handles all auth flows: email/password, Google OAuth, Apple OAuth
- On registration, user selects role (customer or vendor). Role stored in a `profiles` table
- Supabase RLS policies reference the authenticated user's role to gate access
- Next.js middleware checks auth state and redirects unauthenticated users
- Protected routes: all vendor pages require vendor role, booking/messaging require any authenticated role

#### Real-time Messaging
- Supabase Realtime subscribes to INSERT events on the `messages` table
- When either party sends a message, it's written to Postgres and instantly broadcast to the other user's client
- Presence tracking (online/offline indicators) via Supabase Realtime Presence
- Unread counts maintained in the `conversations` table, updated via Postgres triggers

#### File Uploads
- Upload directly from browser to Supabase Storage using signed upload URLs
- Separate storage buckets: `avatars`, `portfolio`, `covers`, `documents`
- Image display via Next.js `<Image>` component pointing to Supabase Storage public URLs
- Max file size: 10MB enforced via Supabase Storage policies
- Accepted formats: PNG, JPG, WebP for images; PDF, PNG, JPG for documents

#### Search
- **Launch:** Postgres full-text search using `tsvector` columns on vendor profiles (business name, description, category, location)
- Support for city, region, and text-based location search
- Radius-based search using PostGIS extension (available on Supabase) with vendor lat/lng coordinates
- **Future:** Algolia integration if search complexity or volume demands it (~free for <10K records)

#### Payments
| Service | Purpose | Cost |
|---|---|---|
| **Stripe Connect** | Marketplace split payments | 1.5% + 20p per transaction (on top of Event Nest's 10%/2% fees) |

- **Flow:** Customer pays total + 2% platform fee via Stripe Checkout. Stripe holds funds. Event Nest takes 10% vendor commission. Remaining amount is paid out to vendor's connected Stripe account.
- Stripe Connect "destination charges" model for automatic split
- Stripe webhooks (handled by Supabase Edge Functions) update booking payment status
- Vendor onboarding: each vendor connects their Stripe account during profile setup
- Refund handling via Stripe API for cancelled bookings

#### Notifications
| Channel | Service | Free tier | Use cases |
|---|---|---|---|
| **In-app** | Supabase Realtime | Included | All notifications - subscribe to `notifications` table |
| **Email** | **Resend** | 3,000 emails/month | Verification, password reset, booking confirmations, inquiry alerts, review requests |
| **SMS** | **Twilio** | Pay-as-you-go (~3p/SMS) | Critical only: booking confirmations, day-before reminders, cancellations |
| **Push** | **Web Push API** (native) | Free | Messages, new inquiries, booking updates |

#### AI (Phase 2 - Inspire Tool)
| Service | Purpose | Cost |
|---|---|---|
| **Claude API** (Anthropic) | Natural language event planning, vendor recommendations, idea generation | Pay-per-token |

- User describes their event in natural language
- Claude queries the vendor database and returns tailored recommendations
- Falls back to general inspiration and ideas when no vendor matches exist
- Budget-aware filtering

### 6.3 Deployment & Infrastructure

| Service | Purpose | Cost |
|---|---|---|
| **Vercel** | Hosting, CDN, serverless functions, preview deployments | Free (hobby tier), $20/mo (Pro) when needed |
| **Supabase** | Backend (see above) | Free tier at launch |
| **Stripe** | Payments | Transaction fees only |
| **Resend** | Email | Free tier at launch |
| **Twilio** | SMS | ~£5-15/month usage-based |
| **GitHub** | Source control, CI/CD via Vercel integration | Free |

**Environment configuration:** Three environments - development (local Supabase via Docker), staging (Supabase project #2), production (primary Supabase project).

### 6.4 Estimated Monthly Costs

| Phase | Monthly cost |
|---|---|
| **Launch (free tiers)** | ~£5-20 (SMS only) |
| **Growth (100+ vendors, 1K+ customers)** | ~£50-100 (Supabase Pro £20, Vercel Pro £16, Resend Pro £16, SMS, Stripe fees) |
| **Scale** | Grows with usage, primarily Stripe transaction fees and Supabase compute |

---

## 7. Implementation Phases

### Phase 1: Foundation & Migration
- Downgrade from Next.js 16 canary to Next.js 15 stable
- Migrate codebase from JavaScript to TypeScript (.jsx -> .tsx)
- Set up Supabase project (Postgres database, Auth, Storage)
- Define Prisma schema from the data model (Section 5) and run initial migration against Supabase Postgres
- Configure Supabase Auth (email/password + Google OAuth)
- Implement registration flow with role selection (customer/vendor)
- Set up Row Level Security (RLS) policies for all tables
- Configure Supabase Storage buckets (avatars, portfolio, covers, documents)
- Set up Next.js middleware for auth-gated routes
- Create Supabase client helpers (server-side and client-side)

### Phase 2: Core Marketplace
- Connect vendor profile editor to Supabase (CRUD operations via Prisma)
- Image upload flow: browser -> Supabase Storage signed URLs
- Customer marketplace fetching real vendor data from Postgres
- Full-text search with Postgres `tsvector` (name, category, location)
- Location search: city/region text match + PostGIS radius search
- Dynamic vendor profile pages (`/vendor/[id]`)
- Wishlist persistence to Supabase
- Replace all hardcoded mock data across every component

### Phase 3: Booking Flow
- Booking request form writes to `bookings` table via Supabase
- Vendor dashboard pulls real inquiry data
- Accept/reject workflow with status updates (new -> pending -> confirmed)
- Calendar page reads from real booking data
- Email notifications via Resend: new inquiry alert (to vendor), booking confirmation (to both)
- Multi-vendor event management: create events, attach bookings to events

### Phase 4: Messaging
- Supabase Realtime subscriptions on `messages` table for instant delivery
- Conversation creation when customer contacts vendor or submits booking
- Message persistence and retrieval with pagination
- Unread count tracking via Postgres triggers on `conversations` table
- Online/offline presence via Supabase Realtime Presence
- Web Push API integration for message notifications

### Phase 5: Analytics & Reviews
- Profile view tracking (log views to analytics table, aggregate with Postgres queries)
- Vendor analytics dashboard pulling real aggregated data
- Conversion funnel: views -> inquiries -> quotes -> bookings (calculated from booking status history)
- Inquiry source tracking (search, category browse, direct link, wishlist)
- Review submission for completed bookings only
- Automated content filtering on reviews (profanity/hate speech detection)
- Vendor single-reply to reviews (`review_replies` table)
- Rating aggregation: Postgres trigger recalculates average on new review

### Phase 6: Payments & Platform Fees
- Stripe Connect onboarding for vendors (link Stripe account during profile setup)
- Stripe Checkout integration for customer booking payments
- Destination charges model: auto-split 10% vendor fee + 2% customer fee
- Stripe webhook handler via Supabase Edge Function (updates `payment_status` on bookings)
- Vendor earnings dashboard (total earned, pending payouts, transaction history)
- Refund handling for cancelled bookings via Stripe API

### Phase 7: Notifications & Polish
- In-app notification system: write to `notifications` table, Supabase Realtime pushes to client (bell icon, unread count, dropdown)
- Email notifications for all key events via Resend (inquiry, booking status, review, reminders)
- SMS via Twilio for critical events only (booking confirmation, day-before reminder, cancellation)
- User notification preference settings (per-channel toggles in account settings)
- Admin dashboard for manual vendor verification (approve/reject vendors + documents)
- SEO: metadata, Open Graph tags, structured data (JSON-LD), sitemap generation
- Performance: lazy loading images, Supabase query caching, Next.js ISR for vendor profiles
- Mobile responsiveness pass across all pages
- Accessibility audit (WCAG 2.1 AA compliance)
- Rate limiting on auth and form submission endpoints

### Phase 8: AI Inspire Tool
- Curated galleries page as Phase 1 fallback (featured vendors, real event highlights)
- Claude API integration for natural language event planning
- Vendor recommendation engine: user describes event -> Claude queries vendor DB -> returns matches
- Budget-aware filtering and suggestions
- Inspiration generation when no vendor matches (theme ideas, decoration tips, activity suggestions)
- Save AI suggestions to customer's event plan

---

## 8. Pages & Routes

| Route | Page | Role | Description |
|---|---|---|---|
| `/` | Vendor Dashboard | Vendor | Home screen with stats and inquiries |
| `/analytics` | Analytics | Vendor | Performance metrics and insights |
| `/calendar` | Calendar | Vendor | Booking calendar and schedule |
| `/messages` | Messages | Vendor | Vendor messaging interface |
| `/profile-editor` | Profile Editor | Vendor | Edit vendor profile |
| `/vendor` | Vendor Profile | Vendor | Preview own profile |
| `/vendor-profile` | Public Profile | Customer | View a vendor's public profile |
| `/marketplace` | Marketplace | Customer | Browse and search vendors |
| `/booking` | Booking Request | Customer | Submit a quote/booking request |
| `/customer-messages` | Messages | Customer | Customer messaging interface |

**Routes to add:**
| Route | Page | Role | Description |
|---|---|---|---|
| `/login` | Login | All | Authentication |
| `/register` | Registration | All | Account creation |
| `/vendor/[id]` | Dynamic Vendor Profile | Customer | View any vendor profile by ID |
| `/bookings` | My Bookings | Customer | View booking history and status |
| `/my-events` | My Events | Customer | Manage planned events |
| `/wishlist` | Wishlist | Customer | Saved vendors |
| `/inspire` | Inspire | Customer | AI event planner (Phase 2) / curated galleries (Phase 1) |
| `/settings` | Account Settings | All | Account and notification preferences |
| `/admin` | Admin Dashboard | Admin | Platform management |

---

## 9. Non-Functional Requirements

### 9.1 Performance
- Page load time under 3 seconds on 3G connection
- Lighthouse performance score above 90
- Image lazy loading with Next.js Image component
- Database query response times under 200ms

### 9.2 Security
- HTTPS everywhere (Vercel handles TLS automatically)
- Supabase Row Level Security (RLS) on all tables - database-level access control
- Input sanitization on all form fields
- SQL injection prevention via Prisma parameterized queries
- XSS prevention (React's default escaping + CSP headers)
- Rate limiting on auth endpoints and form submissions
- File upload validation (type, size) via Supabase Storage policies
- Stripe webhook signature verification on all payment events
- GDPR compliance for UK/EU/ROI users (data export, deletion rights)

### 9.3 Scalability
- Supabase manages connection pooling (PgBouncer built-in)
- Vercel CDN for static assets and edge caching
- Next.js ISR (Incremental Static Regeneration) for vendor profile pages
- Supabase Edge Functions for background processing (email triggers, webhook handlers)
- Image optimization via Next.js `<Image>` component with Supabase Storage URLs

### 9.4 Monitoring
- **Sentry** for error tracking and performance monitoring (free tier: 5K events/month)
- Supabase dashboard for database performance, auth metrics, storage usage
- Vercel analytics for web vitals and deployment health
- Stripe dashboard for payment monitoring and dispute tracking

---

## 10. Design System Reference

The existing mockups establish the following design conventions:

### Colors
- **Primary:** Purple-600 (`#7C3AED`) - CTAs, active states, brand accent
- **Neutral:** Gray scale - backgrounds, borders, text
- **Success:** Green-600 - confirmations, accept actions, availability
- **Warning:** Yellow-500 - pending states, star ratings
- **Error:** Red-500 - wishlist hearts, delete actions, cancellation

### Typography
- Headings: Bold, large sizes (text-4xl for page titles, text-2xl for sections)
- Body: Gray-700, regular weight
- Labels: Gray-600, semibold, small size

### Components
- Cards: Rounded-2xl, white background, gray-200 border
- Buttons: Rounded-xl, bold font, hover state transitions
- Inputs: Rounded-xl, gray-200 border, purple-500 focus ring
- Badges: Rounded-full, colored backgrounds with matching text
- Modals: Centered overlay with rounded-2xl white panel
- Avatars: Rounded-full (users), rounded-2xl (businesses)

### Spacing
- Page padding: px-6
- Max width: max-w-7xl (content), max-w-screen-2xl (messaging)
- Grid gaps: gap-6 standard, gap-8 for major sections
- Section margin: mb-8

---

## 11. Product Decisions

### 11.1 Revenue Model
Event Nest operates on a **split commission per booking** model:
- **Vendor fee:** 10% of booking value
- **Customer fee:** 2% of booking value
- Payments are mediated through the platform via Stripe Connect. The customer pays the full amount + 2% platform fee. Event Nest holds funds and disburses to the vendor minus the 10% commission.

### 11.2 Vendor Verification
- **Phase 1 (launch):** Manual admin review of all vendor applications and uploaded documents before they appear in the marketplace. This protects platform reputation and prevents scammers during early growth.
- **Phase 2 (scale):** Transition to automated verification where possible (document OCR, insurance API checks) with manual review as a fallback for edge cases.

### 11.3 Reviews & Moderation
- Reviews are **auto-published** with automated content filtering (profanity, hate speech, racial slurs). Flagged reviews are held for manual admin review.
- Vendors can post **one reply** per review. No back-and-forth chains.
- Customers can only review vendors for **completed bookings**.

### 11.4 Geographic Scope
- **Launch market:** Northern Ireland and Republic of Ireland.
- **Location search:** Customers can search by city, region, or general location text. Additionally, an optional radius-based search from the user's current location will be supported.
- **Expansion:** Scale to the rest of the UK and beyond based on traction.
- Currency support: GBP (£) and EUR at launch to accommodate both NI and ROI.

### 11.5 Multi-Vendor Event Management
Customers can create **events** as a planning container:
- Each event has a name, date, type, and guest count
- Multiple vendor bookings can be grouped under one event
- Customers can manage multiple events simultaneously (e.g., a birthday party and a wedding)
- Vendor wishlist is per-event (save vendors you're considering for a specific event)
- The "My Events" page serves as the central hub for event planning

### 11.6 Inspire (AI Event Planner)

**Phase 1 (launch):** Curated vendor galleries, featured vendor highlights, and editorial-style content showcasing real events from platform vendors.

**Phase 2:** AI-powered event planning assistant. The user describes their event in natural language (e.g., "I'm planning my child's 8th birthday and he loves dinosaurs") and the tool:
- Recommends matching vendors from the platform
- Suggests ideas, themes, and inspiration photos when no exact vendor match exists
- Accepts budget parameters and filters recommendations accordingly
- Provides actionable suggestions the customer can save to their event plan

### 11.7 Booking Confirmation (formerly "Contracts")
The "View Contract" button is renamed to **"View Booking Confirmation"**. This displays a summary of the agreed booking between vendor and customer, including:
- Vendor and customer details
- Selected package and pricing
- Event date, time, location, and special requests
- Booking status and payment status
- Timestamp of when the booking was confirmed

This is a platform-generated document, not a legal contract.

### 11.8 Notifications
All notification channels will be supported:
- **In-app:** Real-time notification bell with unread count and dropdown
- **Email:** Transactional emails for all key events (new inquiry, booking confirmed, message received, review posted, etc.)
- **SMS:** Critical notifications (booking confirmations, day-before reminders, cancellations)
- **Push:** Browser push notifications for messages and inquiry updates
- Users can configure notification preferences per channel in account settings