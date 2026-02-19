# Event Nest - Database Schema

**ORM:** Prisma
**Database:** PostgreSQL (Supabase)
**Prisma schema file:** `prisma/schema.prisma`

---

## Entity Relationship Overview

```
User (1:1) ── CustomerProfile (1:many) ── Event (1:many) ── Booking
  │                  │                                          │
  │                  ├── Review                                 │
  │                  ├── Wishlist                                │
  │                  └── Conversation ── Message                 │
  │                                                             │
  └── (1:1) ── VendorProfile (1:many) ── Package ──────────────┘
                     │
                     ├── PortfolioImage
                     ├── Document
                     ├── Award
                     ├── ReviewReply
                     └── ProfileView
```

---

## Enums

| Enum | Values |
|---|---|
| `UserRole` | `customer`, `vendor`, `admin` |
| `PricingModel` | `per_day`, `per_head`, `both` |
| `VerificationStatus` | `pending`, `verified`, `rejected` |
| `BookingStatus` | `new_inquiry`, `pending`, `confirmed`, `completed`, `cancelled` |
| `PaymentStatus` | `unpaid`, `paid`, `refunded` |

---

## Tables

### users

Extends Supabase Auth. Stores app-specific role data.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, auto-generated | |
| `email` | string | unique | |
| `role` | UserRole | required | customer, vendor, or admin |
| `created_at` | timestamp | default now | |
| `updated_at` | timestamp | auto-updated | |

**Relations:** has one `CustomerProfile` or `VendorProfile`, has many `Message` (as sender), has many `Notification`

---

### customer_profiles

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK -> users, unique | One profile per user |
| `full_name` | string | required | |
| `phone` | string | nullable | |
| `avatar_url` | string | nullable | Supabase Storage URL |

**Relations:** belongs to `User`, has many `Event`, `Booking`, `Review`, `Wishlist`, `Conversation`

---

### vendor_profiles

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK -> users, unique | One profile per user |
| `business_name` | string | required | |
| `category` | string | required | e.g., "Photography", "Catering" |
| `tagline` | string | nullable | Short marketing line |
| `description` | text | nullable | Full business description |
| `location` | string | nullable | e.g., "Belfast, NI" |
| `latitude` | float | nullable | For PostGIS radius search |
| `longitude` | float | nullable | For PostGIS radius search |
| `response_time` | string | nullable | e.g., "2 hours", "Same day" |
| `cover_image_url` | string | nullable | Supabase Storage URL |
| `profile_image_url` | string | nullable | Supabase Storage URL |
| `pricing_model` | PricingModel | default: per_day | |
| `price_per_day` | decimal(10,2) | nullable | Starting price |
| `price_per_head` | decimal(10,2) | nullable | Starting price |
| `custom_quotes_enabled` | boolean | default: true | Allow custom quote requests |
| `phone` | string | nullable | |
| `email` | string | nullable | |
| `website` | string | nullable | |
| `instagram` | string | nullable | |
| `facebook` | string | nullable | |
| `twitter` | string | nullable | |
| `years_experience` | int | nullable | |
| `completed_events_count` | int | default: 0 | Incremented on booking completion |
| `is_available` | boolean | default: true | Shows "Available for bookings" badge |
| `is_approved` | boolean | default: false | Admin verification gate for marketplace visibility |
| `profile_completion` | int | default: 0 | 0-100 percentage |
| `average_rating` | decimal(2,1) | nullable | Recalculated via trigger on new review |
| `total_reviews` | int | default: 0 | |
| `stripe_account_id` | string | nullable | Stripe Connect account ID |
| `created_at` | timestamp | default now | |
| `updated_at` | timestamp | auto-updated | |

**Relations:** belongs to `User`, has many `Package`, `PortfolioImage`, `Document`, `Award`, `Booking`, `Review`, `ReviewReply`, `Wishlist`, `Conversation`, `ProfileView`

---

### packages

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `vendor_id` | UUID | FK -> vendor_profiles | |
| `name` | string | required | e.g., "Essential", "Premium", "Luxury" |
| `price` | decimal(10,2) | required | |
| `duration` | string | nullable | e.g., "6 hours", "Full day" |
| `is_popular` | boolean | default: false | Shows "MOST POPULAR" badge |
| `sort_order` | int | default: 0 | Display ordering |
| `features` | text[] | Postgres array | e.g., ["Single photographer", "300+ photos"] |

**Relations:** belongs to `VendorProfile`, has many `Booking`

---

### portfolio_images

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `vendor_id` | UUID | FK -> vendor_profiles | |
| `image_url` | string | required | Supabase Storage URL |
| `caption` | string | nullable | |
| `sort_order` | int | default: 0 | Display ordering |
| `created_at` | timestamp | default now | |

**Relations:** belongs to `VendorProfile`

---

### documents

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `vendor_id` | UUID | FK -> vendor_profiles | |
| `file_url` | string | required | Supabase Storage URL |
| `file_name` | string | required | Original filename |
| `file_type` | string | required | e.g., "PDF", "JPG" |
| `file_size` | int | required | Size in bytes |
| `verification_status` | VerificationStatus | default: pending | Admin sets to verified/rejected |
| `admin_notes` | text | nullable | Admin feedback on rejection |
| `created_at` | timestamp | default now | |

**Relations:** belongs to `VendorProfile`

---

### awards

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `vendor_id` | UUID | FK -> vendor_profiles | |
| `title` | string | required | e.g., "UK Wedding Photographer of the Year 2023" |
| `year` | int | nullable | |

**Relations:** belongs to `VendorProfile`

---

### events

Customer-created event containers that group multiple vendor bookings.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `customer_id` | UUID | FK -> customer_profiles | |
| `name` | string | required | e.g., "Our Wedding", "Tom's 25th Birthday" |
| `event_date` | date | nullable | |
| `event_type` | string | nullable | e.g., "Wedding", "Birthday Party" |
| `guest_count` | int | nullable | |
| `venue_name` | string | nullable | |
| `venue_address` | string | nullable | |
| `created_at` | timestamp | default now | |
| `updated_at` | timestamp | auto-updated | |

**Relations:** belongs to `CustomerProfile`, has many `Booking`, `Wishlist`

---

### bookings

Core entity tracking the full inquiry-to-completion lifecycle.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `event_id` | UUID | FK -> events, nullable | Groups bookings under an event |
| `vendor_id` | UUID | FK -> vendor_profiles | |
| `customer_id` | UUID | FK -> customer_profiles | |
| `package_id` | UUID | FK -> packages, nullable | Selected package |
| `event_date` | date | nullable | |
| `event_type` | string | nullable | |
| `guest_count` | int | nullable | |
| `venue_name` | string | nullable | |
| `venue_address` | string | nullable | |
| `start_time` | string | nullable | "14:00" format |
| `end_time` | string | nullable | |
| `additional_services` | text[] | Postgres array | Selected add-ons |
| `special_requests` | text | nullable | Free-text notes |
| `contact_name` | string | nullable | |
| `contact_email` | string | nullable | |
| `contact_phone` | string | nullable | |
| `hear_about` | string | nullable | Inquiry source for analytics |
| `status` | BookingStatus | default: new_inquiry | |
| `total_price` | decimal(10,2) | nullable | |
| `vendor_fee` | decimal(10,2) | nullable | 10% of total_price |
| `customer_fee` | decimal(10,2) | nullable | 2% of total_price |
| `payment_status` | PaymentStatus | default: unpaid | |
| `stripe_payment_id` | string | nullable | Stripe payment/checkout ID |
| `confirmed_at` | timestamp | nullable | When vendor confirmed |
| `created_at` | timestamp | default now | |
| `updated_at` | timestamp | auto-updated | |

**Indexes:** `(vendor_id, status)`, `(customer_id)`, `(event_date)`

**Relations:** belongs to `Event` (optional), `VendorProfile`, `CustomerProfile`, `Package` (optional); has one `Conversation`, has one `Review`

**Status lifecycle:**
```
new_inquiry -> pending -> confirmed -> completed
                  |
                  v
              cancelled
```

---

### conversations

One conversation per vendor-customer pair.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `booking_id` | UUID | FK -> bookings, unique, nullable | Links to originating booking |
| `vendor_id` | UUID | FK -> vendor_profiles | |
| `customer_id` | UUID | FK -> customer_profiles | |
| `unread_vendor` | int | default: 0 | Unread message count for vendor |
| `unread_customer` | int | default: 0 | Unread message count for customer |
| `last_message_at` | timestamp | nullable | For sorting conversations |
| `created_at` | timestamp | default now | |

**Unique constraint:** `(vendor_id, customer_id)` - one thread per pair

**Indexes:** `(vendor_id)`, `(customer_id)`

**Relations:** belongs to `Booking` (optional), `VendorProfile`, `CustomerProfile`; has many `Message`

---

### messages

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `conversation_id` | UUID | FK -> conversations | |
| `sender_id` | UUID | FK -> users | |
| `text` | text | required | Message content |
| `is_read` | boolean | default: false | |
| `created_at` | timestamp | default now | |

**Index:** `(conversation_id, created_at)` - for paginated message retrieval

**Supabase Realtime:** Subscribe to INSERTs on this table for instant message delivery.

**Relations:** belongs to `Conversation`, `User` (sender)

---

### reviews

One review per completed booking.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `vendor_id` | UUID | FK -> vendor_profiles | |
| `customer_id` | UUID | FK -> customer_profiles | |
| `booking_id` | UUID | FK -> bookings, unique | One review per booking |
| `rating` | int | required | 1-5 stars |
| `text` | text | required | Review content |
| `event_date` | string | nullable | Display string, e.g., "August 15, 2025" |
| `is_flagged` | boolean | default: false | Auto-flagged by content filter |
| `created_at` | timestamp | default now | |

**Index:** `(vendor_id, created_at)`

**Triggers:** On INSERT, recalculate `vendor_profiles.average_rating` and increment `vendor_profiles.total_reviews`.

**Relations:** belongs to `VendorProfile`, `CustomerProfile`, `Booking`; has one `ReviewReply`

---

### review_replies

One reply per review, enforced by unique constraint on `review_id`.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `review_id` | UUID | FK -> reviews, unique | One reply allowed |
| `vendor_id` | UUID | FK -> vendor_profiles | |
| `text` | text | required | |
| `created_at` | timestamp | default now | |

**Relations:** belongs to `Review`, `VendorProfile`

---

### wishlists

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `customer_id` | UUID | FK -> customer_profiles | |
| `vendor_id` | UUID | FK -> vendor_profiles | |
| `event_id` | UUID | FK -> events, nullable | Save vendor for a specific event |
| `created_at` | timestamp | default now | |

**Unique constraint:** `(customer_id, vendor_id, event_id)` - no duplicates

**Relations:** belongs to `CustomerProfile`, `VendorProfile`, `Event` (optional)

---

### notifications

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK -> users | |
| `type` | string | required | e.g., "new_inquiry", "booking_confirmed", "message_received" |
| `title` | string | required | e.g., "New inquiry from Sarah & Mark" |
| `body` | text | nullable | Additional detail |
| `link` | string | nullable | In-app route, e.g., "/messages" |
| `is_read` | boolean | default: false | |
| `channels_sent` | text[] | Postgres array | e.g., ["email", "sms", "push"] |
| `created_at` | timestamp | default now | |

**Index:** `(user_id, is_read, created_at)` - for unread count and sorted feed

**Supabase Realtime:** Subscribe to INSERTs on this table for real-time in-app notifications.

**Relations:** belongs to `User`

---

### profile_views

Analytics table tracking vendor profile visits.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `vendor_id` | UUID | FK -> vendor_profiles | |
| `source` | string | nullable | "search", "category_browse", "direct_link", "wishlist" |
| `viewed_at` | timestamp | default now | |

**Index:** `(vendor_id, viewed_at)` - for time-range aggregation queries

**Relations:** belongs to `VendorProfile`

---

## Postgres Triggers (to be created via Supabase SQL editor)

1. **Review rating aggregation:** On INSERT/DELETE on `reviews`, recalculate `vendor_profiles.average_rating` and `vendor_profiles.total_reviews` for the affected vendor.

2. **Conversation unread counts:** On INSERT on `messages`, increment `conversations.unread_vendor` or `conversations.unread_customer` (depending on sender role) and update `conversations.last_message_at`.

3. **Completed events counter:** On UPDATE of `bookings.status` to `completed`, increment `vendor_profiles.completed_events_count`.

---

## Row Level Security (RLS) Policy Summary

| Table | Read | Write |
|---|---|---|
| `users` | Own record only | Own record only |
| `customer_profiles` | Own record only | Own record only |
| `vendor_profiles` | Approved vendors: public read. Own record: full read | Own record only |
| `packages` | Public (via vendor profile) | Owning vendor only |
| `portfolio_images` | Public (via vendor profile) | Owning vendor only |
| `documents` | Owning vendor + admins | Owning vendor (create/delete), admin (update status) |
| `awards` | Public (via vendor profile) | Owning vendor only |
| `events` | Owning customer only | Owning customer only |
| `bookings` | Owning vendor or customer | Customer creates, vendor updates status, system updates payment |
| `conversations` | Participating vendor or customer | Participating vendor or customer |
| `messages` | Participants of parent conversation | Participants of parent conversation |
| `reviews` | Public read | Customer creates (completed bookings only) |
| `review_replies` | Public read | Owning vendor only, one per review |
| `wishlists` | Owning customer only | Owning customer only |
| `notifications` | Own records only | System creates, user marks as read |
| `profile_views` | Owning vendor (aggregated) | System creates on profile visit |
