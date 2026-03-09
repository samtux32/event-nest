# EventNestGroup Marketing Skills

> Marketing playbook for **eventnestgroup.com** — a two-sided marketplace connecting event customers with professional vendors across the UK, Ireland, and beyond.

---

## Brand & Positioning

### Market Position
Event Nest sits at the intersection of event planning and vendor discovery. The positioning is **"The Smarter Way to Plan Events"** — emphasising simplicity, AI assistance, and verified quality over the chaos of searching Google, Instagram, and word-of-mouth.

### Target Audiences

**Customers (demand side)**
- People planning weddings, birthdays, corporate events, baby showers, anniversaries
- Budget-conscious planners who want transparent pricing and verified reviews
- First-time event planners overwhelmed by vendor coordination
- Key trigger phrases: "find a photographer for my wedding", "event vendors near me", "how to plan a birthday party"

**Vendors (supply side)**
- Photographers, caterers, DJs, florists, decorators, videographers, venues, cake makers
- Small business owners who rely on Instagram/word-of-mouth and want a booking pipeline
- Professionals who want verified reviews and a managed profile rather than maintaining their own site

### Positioning Skills Needed
- **Product marketing context** (`marketing-skills:product-marketing-context`) — define ICPs, pain points, and value props for both sides of the marketplace
- **Pricing strategy** (`marketing-skills:pricing-strategy`) — vendor fee (10%) and customer fee (2%) positioning, freemium vs premium vendor tiers
- **Competitor alternatives** (`marketing-skills:competitor-alternatives`) — create "Event Nest vs [competitor]" comparison pages (Bark, Poptop, AddToEvent, Hitched, Bridebook)
- **Marketing psychology** (`marketing-skills:marketing-psychology`) — social proof (reviews with photos), scarcity (vendor availability/blocked dates), trust (verified badges, admin approval gate)

### Key Differentiators to Message
- AI event planner that generates full plans with budgets and vendor recommendations
- Direct vendor messaging and custom quote negotiation (no hidden middleman)
- Verified reviews with photos — not anonymous ratings
- One platform for discovery, booking, messaging, and coordination
- Free for customers; vendors only pay when they get business

---

## Event Marketing

### Launch & Feature Announcements
- **Launch strategy** (`marketing-skills:launch-strategy`) — plan go-to-market for new cities, vendor categories, or major features
- Use the ORB framework: build email list (owned), post on Instagram/TikTok/LinkedIn (rented), pitch to wedding blogs and event publications (borrowed)
- Every new vendor category launch (e.g., "Cake makers now on Event Nest") is a mini-launch with its own announcement cycle

### Event-Specific Campaigns
- **Seasonal pushes**: wedding season (April–September UK), Christmas party season (October–December), graduation/prom (May–July), festival season (June–August)
- **Event-type campaigns**: "Wedding Planning Made Simple" landing page, "Corporate Event Vendor Guide", "Birthday Party Ideas + Book Vendors"
- Create urgency around vendor availability: "Top-rated photographers are 80% booked for June — secure yours now"

### Vendor Acquisition Marketing
- Target vendors where they already are: Instagram DMs, Facebook groups for event professionals, local business directories
- **Cold email** (`marketing-skills:cold-email`) — outreach to photographers, caterers, DJs in target cities
- Vendor testimonials and case studies: "How [Vendor Name] got 15 bookings in 3 months on Event Nest"
- Referral programme: existing vendors refer other vendors (referral codes already built in the platform)

### Customer Acquisition Marketing
- **Referral program** (`marketing-skills:referral-program`) — "Plan together, save together" — customers who refer friends get perks
- Partner with wedding venues to recommend Event Nest for finding complementary vendors
- Sponsor or attend local wedding fairs, event expos, and bridal shows

---

## Digital Marketing

### SEO
- **SEO audit** (`marketing-skills:seo-audit`) — technical SEO for the Next.js app (Core Web Vitals, meta tags, structured data, crawlability)
- **AI SEO** (`marketing-skills:ai-seo`) — optimise for AI search engines (ChatGPT, Perplexity) by structuring vendor and category pages with clear, factual content
- **Programmatic SEO** (`marketing-skills:programmatic-seo`) — generate pages at scale:
  - `/{category}-in-{city}` — "Wedding Photographers in Dublin", "Caterers in London"
  - `/{event-type}-vendors` — "Wedding Vendors", "Birthday Party Vendors"
  - `/{category}-prices` — "How Much Does a Wedding Photographer Cost?"
- **Schema markup** (`marketing-skills:schema-markup`) — LocalBusiness, Event, Review, FAQPage schema on vendor profiles
- **Site architecture** (`marketing-skills:site-architecture`) — plan URL structure, internal linking between category pages, vendor profiles, and inspiration articles

### Target Keywords (Priority)
- "event vendors near me", "wedding vendors [city]", "find a [category] for my [event]"
- "how to plan a [event type]", "event planning checklist", "[event type] budget breakdown"
- "best [category] in [city]", "[category] prices UK", "[category] reviews"
- Long-tail: "how much does a wedding photographer cost in London", "questions to ask a caterer before booking"

### Social Media
- **Social content** (`marketing-skills:social-content`) — create platform-specific content:
  - **Instagram/TikTok**: vendor spotlights, behind-the-scenes event content, "vendor of the week", before/after event setups, customer testimonials
  - **LinkedIn**: vendor success stories, industry insights, partnership announcements
  - **Pinterest**: event inspiration boards linking back to marketplace categories
  - **Facebook**: local event planning groups, community building, vendor introductions
- Encourage vendors to share their Event Nest profile and reviews on their own social channels
- User-generated content: repost customer event photos (with permission) tagged with Event Nest

### Paid Ads
- **Paid ads** (`marketing-skills:paid-ads`) — campaigns for both sides of the marketplace:
  - **Google Ads**: target high-intent searches ("book wedding photographer", "event caterers near me")
  - **Meta Ads**: lookalike audiences based on existing customers, retarget marketplace browsers who didn't book
  - **Instagram Ads**: visual vendor portfolio ads targeting engaged couples and event planners
- **Ad creative** (`marketing-skills:ad-creative`) — generate ad variations highlighting reviews, AI planner, and vendor selection
- Start with Google Search ads (highest intent) before scaling to social

### Email Campaigns
- **Email sequence** (`marketing-skills:email-sequence`) — lifecycle emails for both audiences:
  - **Customer onboarding**: welcome → "How to use the AI planner" → "Browse vendors in your area" → "Your first booking"
  - **Vendor onboarding**: welcome → "Complete your profile" → "Add packages and portfolio" → "Your first inquiry"
  - **Re-engagement**: "New vendors in your area", "Your wishlist vendors have availability", "Seasonal event planning tips"
  - **Post-event**: review request → "Plan your next event" → referral prompt
- Already using Resend for transactional emails (15 templates) — extend to marketing sequences

### Landing Pages
- **Copywriting** (`marketing-skills:copywriting`) — write conversion-focused landing pages:
  - `/vendor-signup` — convince vendors to join (already exists, optimise copy)
  - Category-specific landing pages for SEO and ads
  - Event-type landing pages ("Plan Your Wedding with Event Nest")
- **Page CRO** (`marketing-skills:page-cro`) — optimise homepage, marketplace, and vendor signup for conversions
- **Signup flow CRO** (`marketing-skills:signup-flow-cro`) — reduce friction in customer registration and vendor onboarding
- **Form CRO** (`marketing-skills:form-cro`) — optimise booking request form and contact form

---

## Content Marketing

### Content Strategy
- **Content strategy** (`marketing-skills:content-strategy`) — plan content that drives organic traffic and builds authority
- 30 inspiration articles already exist at `/inspiration` — expand and optimise for SEO

### Content Pillars

**1. Event Planning Guides (Searchable)**
- "Complete Guide to Planning a [Event Type]"
- "How to Choose a [Vendor Category]"
- "[Event Type] Budget Breakdown: What to Expect"
- "Questions to Ask Before Booking a [Vendor Category]"
- "[Number] [Event Type] Ideas for [Year]"

**2. Vendor Spotlights (Shareable)**
- Featured vendor interviews with portfolio highlights
- "Day in the Life of a Wedding Photographer"
- Vendor tips: "What Your Caterer Wishes You Knew"
- Success stories: vendors who grew their business on Event Nest

**3. Real Event Stories (Shareable + Searchable)**
- Customer event recaps with photos and vendor credits
- Budget breakdowns from real events
- "How [Customer] Planned Their Wedding in 3 Months Using AI"

**4. Industry & Seasonal Content (Searchable)**
- "[Year] Wedding Trends"
- "Christmas Party Planning: Start Now for December"
- "Summer Festival Guide: Vendors You Need"
- Event planning checklists by event type

### Content Formats
- Blog posts on `/inspiration` (already 30 articles — grow to 100+)
- Short-form video (Instagram Reels, TikTok) featuring vendors and events
- Email newsletters with seasonal planning tips
- Downloadable checklists and budget templates (lead magnets)

### Copy Editing
- **Copy editing** (`marketing-skills:copy-editing`) — review and tighten existing marketing copy across the site
- Ensure consistent voice: helpful, modern, approachable — not corporate or salesy

---

## Partnerships & Community

### Venue Partnerships
- Partner with popular venues to recommend Event Nest as the vendor discovery platform
- Co-branded landing pages: "Find Vendors for [Venue Name]"
- Venue owners can list on Event Nest as a vendor category

### Vendor Community
- Build a vendor community (Slack, WhatsApp, or in-platform) for networking and tips
- Vendor referral programme: existing vendors earn credit for referring other vendors
- QR code feature (already built) lets vendors promote their Event Nest profile at events and expos

### Influencer & Creator Partnerships
- Partner with wedding bloggers, event influencers, and lifestyle creators
- **Affiliate programme**: creators earn commission for bookings driven through their referral links
- Provide creators with exclusive vendor showcases or early access to features

### Industry Partnerships
- Wedding fairs, bridal expos, corporate event conferences — sponsor or attend
- Event planning associations and directories — get listed and linked
- Local business networks in target cities

### Press & PR
- **Launch strategy** (`marketing-skills:launch-strategy`) — pitch to wedding magazines, event industry publications, local press
- Newsworthy angles: "AI-powered event planning", "How a marketplace is changing the events industry"
- Case studies with real numbers: bookings processed, vendor growth, customer satisfaction

---

## Analytics & Growth

### Tracking Setup
- **Analytics tracking** (`marketing-skills:analytics-tracking`) — GA4 is already integrated (consent-gated), plus Vercel Analytics and Speed Insights
- Track these key events in GA4:
  - `vendor_profile_view` (with source attribution — already tracked via ProfileView model)
  - `booking_inquiry_sent` — customer sends booking request
  - `quote_accepted` — customer accepts vendor quote
  - `vendor_signup_completed` — new vendor finishes registration
  - `ai_planner_used` — customer generates an AI event plan
  - `wishlist_add` — vendor saved to wishlist
  - `search_performed` — marketplace search with filters used

### Key Metrics to Monitor

**Marketplace health (two-sided)**
- Vendor-to-customer ratio by category and city
- Vendor response rate and response time
- Booking conversion rate (inquiry → confirmed)
- Quote acceptance rate

**Customer acquisition**
- Cost per acquisition by channel (organic, paid, referral)
- Marketplace browse-to-inquiry rate
- AI planner usage rate and plan-to-booking conversion

**Vendor acquisition**
- Vendor signup rate and profile completion rate
- Time to first inquiry after profile goes live
- Vendor retention (monthly active vendors)

**Revenue**
- Gross merchandise value (total booking value)
- Platform revenue (vendor fee 10% + customer fee 2%)
- Revenue per vendor per month

### A/B Testing
- **A/B test setup** (`marketing-skills:ab-test-setup`) — test variations on:
  - Homepage hero copy and CTA
  - Vendor signup page messaging
  - Booking request form layout
  - AI planner prompt suggestions
  - Email subject lines (transactional and marketing)

### Growth Loops
- **Vendor growth loop**: Vendor joins → gets bookings → earns reviews → ranks higher → gets more bookings
- **Customer growth loop**: Customer books → has great event → leaves review → refers friends → friends book
- **Content growth loop**: Publish guide → ranks in search → customer discovers Event Nest → browses vendors → books
- **AI planner loop**: Customer uses AI planner → gets vendor recommendations → books vendors → Event Nest earns fee

### Churn Prevention
- **Churn prevention** (`marketing-skills:churn-prevention`) — vendor-focused retention:
  - Monitor vendors with zero inquiries after 30 days — send tips email
  - Flag vendors with incomplete profiles — send completion reminders
  - Identify vendors who stop logging in — re-engagement campaign
  - Seasonal slowdown messaging: "Wedding season is 3 months away — update your portfolio now"

---

## AI & Automation for Marketing

### AI Tools Already In Use
- **Claude AI event planner** (Anthropic SDK) — generates personalised event plans with budget breakdowns, vendor recommendations, timelines, and checklists
- This is a core differentiator — market it heavily as "the AI event planning assistant"

### AI for Content Creation
- Use Claude to generate first drafts of blog posts, vendor spotlights, and social captions
- AI-generated event checklists (already built) double as shareable content pieces
- Generate SEO-optimised meta descriptions and page titles at scale for programmatic pages

### AI for Personalisation
- Personalised vendor recommendations based on event type, budget, and location
- "Vendors like the ones you saved" recommendations on the marketplace
- Smart email content: "Based on your wedding in June, here are available photographers"

### Automation Workflows
- **Vendor onboarding automation**: signup → welcome email → profile completion reminders → first inquiry celebration
- **Customer lifecycle automation**: registration → AI planner suggestion → browse vendors → booking reminder → review request → referral prompt
- **Review collection automation**: booking completes → wait 2 days → send review request email (already built via cron)
- **Re-engagement automation**: inactive for 14 days → "New vendors in your area" email → inactive for 30 days → "We miss you" email

### Marketing Tools to Integrate
- **Resend** (already integrated) — extend from transactional to marketing email sequences
- **GA4** (already integrated) — configure conversion events and custom audiences
- **Google Search Console** — monitor organic rankings for target keywords
- **Meta Pixel** — retargeting for marketplace browsers
- **Mailchimp or Customer.io** — marketing automation for drip campaigns beyond transactional emails

### Relevant Marketing Skills
All 32 skills from the `marketing-skills` plugin are available. The most relevant for Event Nest, mapped to priority:

| Priority | Skill | Use Case |
|----------|-------|----------|
| High | `product-marketing-context` | Define positioning for both marketplace sides |
| High | `copywriting` | Homepage, vendor signup, landing pages |
| High | `seo-audit` | Technical SEO for Next.js marketplace |
| High | `content-strategy` | Plan blog and inspiration content |
| High | `email-sequence` | Vendor and customer lifecycle emails |
| High | `launch-strategy` | New city/category launches |
| High | `programmatic-seo` | Category + city pages at scale |
| Medium | `social-content` | Instagram, TikTok, LinkedIn content |
| Medium | `paid-ads` | Google and Meta ad campaigns |
| Medium | `referral-program` | Customer and vendor referral programmes |
| Medium | `page-cro` | Optimise marketplace and signup conversions |
| Medium | `signup-flow-cro` | Reduce vendor onboarding friction |
| Medium | `analytics-tracking` | GA4 event tracking setup |
| Medium | `competitor-alternatives` | "Event Nest vs" comparison pages |
| Medium | `schema-markup` | Rich snippets for vendor profiles |
| Medium | `cold-email` | Vendor acquisition outreach |
| Lower | `ab-test-setup` | Test copy and layout variations |
| Lower | `ad-creative` | Generate ad variations |
| Lower | `ai-seo` | Optimise for AI search engines |
| Lower | `churn-prevention` | Vendor retention flows |
| Lower | `site-architecture` | URL and navigation planning |
| Lower | `form-cro` | Booking request form optimisation |
| Lower | `copy-editing` | Polish existing site copy |
| Lower | `popup-cro` | Email capture popups |
| Lower | `marketing-ideas` | Brainstorm new growth tactics |
| Lower | `pricing-strategy` | Fee structure optimisation |
| Lower | `marketing-psychology` | Persuasion and trust signals |
| Lower | `onboarding-cro` | Post-signup activation |
| Lower | `free-tool-strategy` | Free planning tools as lead magnets |
