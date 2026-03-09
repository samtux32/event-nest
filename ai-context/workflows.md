# Workflows

## Customer Journey

### Discovery
1. Customer arrives via search, social media, referral, or direct visit
2. Browses `/marketplace` — filters by category, location, price range, rating
3. Views vendor profiles — portfolio, packages, reviews, FAQs
4. Saves vendors to wishlists organised by group ("Wedding Shortlist", "Maybe")
5. Compares vendors side-by-side on `/compare`

### AI Planning (Optional)
1. Customer opens `/plan-my-event`
2. Inputs event details: type, budget, guest count, theme, preferences
3. AI generates a full plan: budget breakdown by category, vendor recommendations, timeline, tips
4. Customer saves the plan to `/my-plans`
5. Plan links to marketplace categories for easy vendor browsing

### Booking
1. Customer clicks "Book" on a vendor profile
2. Fills booking request form: event date, type, guest count, special requests, package selection
3. System creates booking (status: `new_inquiry`) + conversation + notification
4. Vendor receives notification (in-app + push + email)
5. Booking appears in customer's `/my-bookings` dashboard

### Quote Negotiation
1. Vendor reviews the inquiry in their messages
2. Vendor sends a custom quote: title, description, itemised features, total price
3. Customer receives quote notification
4. Customer reviews quote in the conversation → accepts or declines
5. If accepted: booking status changes to `confirmed`, vendor and customer both notified
6. If declined: vendor can send a revised quote

### Event Coordination
1. Customer and vendor communicate via real-time messaging
2. Vendor can propose alternative dates if needed
3. Customer tracks all bookings in `/my-bookings` with status indicators
4. Customer adds confirmed events to calendar (ICS export)
5. System sends push/email reminders 3 days before the event

### Post-Event
1. Cron job auto-marks bookings as `completed` after event date passes
2. Customer receives review request email
3. Customer writes review with rating (1–5 stars) and optional photos
4. Vendor can reply to the review
5. Vendor can also review the customer (mutual review system)
6. Customer receives referral prompt to share Event Nest

---

## Vendor Journey

### Registration
1. Vendor visits `/vendor-signup`
2. Creates account with email and password
3. System creates user (role: vendor) + empty vendor profile
4. Vendor receives welcome email

### Onboarding
1. Vendor opens profile editor
2. Completes business details: name, bio, tagline, categories, location
3. Uploads portfolio images with captions
4. Creates service packages: name, price, duration, features
5. Adds FAQs, social media links, cancellation policy
6. System calculates profile completion percentage
7. Profile submitted for admin approval

### Approval
1. Admin reviews vendor profile in `/admin` dashboard
2. Admin approves or rejects with feedback
3. If approved: vendor appears in marketplace, receives approval email
4. If rejected: vendor can update profile and resubmit

### Receiving Inquiries
1. Customer sends booking request → vendor notified (push + email + in-app)
2. Vendor views inquiry in messages
3. Vendor reviews event details, dates, and customer requirements
4. Vendor sends custom quote or responds with questions
5. Quote negotiation continues until accepted or declined

### Managing Bookings
1. Vendor tracks all bookings in dashboard: new inquiries, pending, confirmed, completed
2. Vendor blocks unavailable dates on calendar
3. Vendor views booking statistics: total inquiries, conversion rate, revenue
4. Completed bookings trigger review request to customer

### Growing Business
1. Vendor monitors analytics: profile views (by source), inquiry rates, booking conversions
2. Vendor creates time-limited promotions and special offers
3. Vendor uses referral code / QR code to refer other vendors
4. Vendor responds to reviews to build visible reputation
5. Vendor updates portfolio and packages based on booking patterns

---

## Notification Workflow

### How Notifications Fire
Every significant action calls `createNotification()` which:
1. Creates a database record (in-app notification)
2. Fires `sendPushToUser()` via web-push (VAPID) — fire and forget
3. Sends relevant email template via Resend — fire and forget

### Notification Triggers
| Event | Who Gets Notified | Channels |
|-------|-------------------|----------|
| New booking inquiry | Vendor | Push, email, in-app |
| Quote sent | Customer | Push, email, in-app |
| Quote accepted | Vendor | Push, email, in-app |
| Quote declined | Vendor | Push, email, in-app |
| New message | Recipient | Push, email, in-app |
| Date proposed | Customer | Push, email, in-app |
| Booking confirmed | Both | Push, email, in-app |
| Booking cancelled | Both | Push, email, in-app |
| Event reminder (3 days) | Customer | Push, email, in-app |
| Review received | Vendor | Push, email, in-app |
| Review request | Customer | Email |
| Vendor approved | Vendor | Email, in-app |
| Welcome | New user | Email |
| Account deleted | User | Email |

---

## Cron Job Workflows

### Complete Bookings (Daily, 2 AM UTC)
1. Query all bookings with status `confirmed` and event date in the past
2. Update status to `completed`
3. Send review request email to customer

### Event Reminders (Daily, 9 AM UTC)
1. Query all bookings with event date 3 days from now
2. Send reminder notification to customer (push + email + in-app)

---

## Admin Workflow
1. Admin logs in → redirected to `/admin` dashboard
2. Reviews pending vendor applications → approve or reject
3. Reviews flagged reviews → remove or unflag
4. Monitors platform-wide statistics
