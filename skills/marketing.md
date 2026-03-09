# Marketing Skills

## SEO

### Programmatic SEO (Highest Priority)
Generate pages at scale targeting location + category searches:
- `/{category}-in-{city}` — "Wedding Photographers in Dublin", "Caterers in London"
- `/{event-type}-vendors` — "Wedding Vendors", "Birthday Party Vendors"
- `/{category}-prices` — "How Much Does a Wedding Photographer Cost?"
- Each page pulls live vendor data from the marketplace — not static content

### Target Keywords
**High intent (bottom of funnel)**:
- "book [category] for [event type]"
- "[category] near me"
- "[category] in [city]"
- "best [category] [city]"

**Research phase (mid funnel)**:
- "how much does a [category] cost"
- "questions to ask a [category] before booking"
- "[event type] vendor checklist"
- "how to choose a [category]"

**Planning phase (top of funnel)**:
- "how to plan a [event type]"
- "[event type] budget breakdown"
- "[event type] planning timeline"
- "[year] [event type] trends"

### Technical SEO
- Schema markup on vendor profiles: LocalBusiness, Review, FAQPage, AggregateRating
- Event schema on booking confirmations
- Open Graph and Twitter Card meta tags on all pages (OG image already exists)
- Sitemap at `/sitemap.xml` (already generated)
- `robots.txt` configured (already exists)
- Core Web Vitals monitoring via Vercel Speed Insights

### AI SEO
- Structure vendor profiles and category pages with clear, factual content that AI search engines can cite
- Answer common questions directly on pages (FAQ sections, pricing guides)
- Consistent brand mentions across the web for AI model training data

## Social Media

### Platform Strategy
| Platform | Purpose | Content Type |
|----------|---------|-------------|
| Instagram | Vendor spotlights, event inspiration | Reels, carousels, stories |
| TikTok | Behind-the-scenes, viral event content | Short-form video |
| Pinterest | Event inspiration boards | Pins linking to marketplace categories |
| LinkedIn | Vendor success stories, industry insights | Long-form posts, articles |
| Facebook | Local community engagement | Group participation, event shares |

### Content Themes
- **Vendor of the week**: Feature a top-rated vendor with portfolio highlights
- **Before/after**: Event setup transformations (decorators, florists, venues)
- **Budget breakdowns**: Real event costs with vendor category splits
- **Planning tips**: Quick tips from real vendors ("What your caterer wishes you knew")
- **Customer stories**: Real events planned through Event Nest with photos

### Encouraging Vendor Amplification
- Vendors share their Event Nest profile link on their own social channels
- Vendor QR codes (already built) for use at events and expos
- Vendors repost their reviews from Event Nest

## Email Marketing

### Transactional Emails (Already Built — 15 templates via Resend)
- Welcome, booking confirmations, quote notifications, review requests, reminders, cancellations

### Marketing Sequences to Build
**Customer onboarding (post-registration)**:
1. Welcome + "How to use the AI planner" (Day 0)
2. "Browse vendors in your area" with category highlights (Day 2)
3. "Your first booking — here's how it works" (Day 5)
4. "Planning tips for your [event type]" (Day 10)

**Vendor onboarding (post-registration)**:
1. Welcome + "Complete your profile" checklist (Day 0)
2. "Add packages and portfolio — here's why it matters" (Day 2)
3. "Your profile is live — here's what to expect" (after approval)
4. "Tips from top vendors on Event Nest" (Day 14)

**Re-engagement**:
- "New vendors in your area" (for inactive customers)
- "Your wishlisted vendors have availability" (for customers with wishlists)
- "Update your portfolio for [season]" (for inactive vendors)

**Post-event**:
- Review request (Day 2 after event — already automated via cron)
- "Plan your next event" (Day 14)
- Referral prompt (Day 21)

## Paid Advertising

### Priority Order
1. **Google Search Ads**: Highest intent. Target "book [category] [city]" searches.
2. **Meta (Instagram/Facebook) Ads**: Retarget marketplace browsers who didn't book. Lookalike audiences based on existing customers.
3. **Pinterest Ads**: Event inspiration → marketplace browsing pipeline.
4. **LinkedIn Ads**: Only for corporate event planning segment.

### Ad Messaging
- Customer ads: "Find verified event vendors. Compare prices. Book with confidence."
- Vendor ads: "Get bookings, not leads. Only pay when you win the business."
- AI planner ads: "Plan your entire event in minutes — free AI event planning assistant."

## Landing Pages

### Pages to Create/Optimise
- `/vendor-signup` — vendor acquisition (already exists, optimise copy)
- Category landing pages for ad campaigns
- Event-type landing pages: "Plan Your Wedding with Event Nest"
- City-specific pages: "Event Vendors in [City]"
- Competitor comparison: "Event Nest vs Bark", "Event Nest vs Poptop"

### Conversion Optimisation Priorities
1. Homepage → marketplace browsing (reduce bounce rate)
2. Vendor profile → booking inquiry (increase inquiry rate)
3. Vendor signup page → completed registration
4. AI planner → saved plan → vendor booking
