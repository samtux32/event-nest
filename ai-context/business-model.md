# Business Model

## Revenue Model
Event Nest is a transaction-based marketplace. Revenue comes from fees on confirmed bookings.

### Fee Structure
| Fee | Who Pays | When |
|-----|----------|------|
| 10% vendor fee | Vendor | On confirmed booking |
| 2% service fee | Customer | On confirmed booking |

### Why This Model
- **Free for customers to browse and book**: Removes friction on the demand side
- **Vendors only pay on results**: Unlike Bark (pay per lead) or directories (pay for listing), vendors keep 100% until they win business
- **Aligned incentives**: Event Nest only earns when vendors succeed — motivates the platform to drive quality leads

## Unit Economics

### Key Metrics
- **Gross Merchandise Value (GMV)**: Total booking value flowing through the platform
- **Take rate**: 12% combined (10% vendor + 2% customer)
- **Revenue per booking**: 12% of average booking value
- **Average booking value**: Varies by category — wedding photography (£1,000–3,000), catering (£2,000–10,000), DJ (£300–800)

### Cost Structure
| Cost | Monthly | Notes |
|------|---------|-------|
| Supabase Pro | £25 | Database, auth, storage, realtime |
| Vercel | Free tier | Hosting, serverless, cron (upgrade at ~£20/month when needed) |
| Resend | Free tier | Email (upgrade at ~£20/month when hitting 100 emails/day) |
| Anthropic API | Usage-based | AI event planner — ~£0.01–0.05 per plan generated |
| Domain | ~£15/year | eventnestgroup.com |

### Path to Revenue
1. **Current**: Building vendor supply and customer demand
2. **Near-term**: First confirmed bookings generate revenue through fees
3. **Growth**: Revenue scales linearly with GMV — more bookings = more revenue
4. **Future options**: Premium vendor profiles, featured listings, promoted placements

## Pricing Strategy

### Current Approach
- Simple, transparent, one-tier pricing for vendors
- No subscription — removes barrier to vendor signup
- Customer fees kept low (2%) to avoid deterring bookings

### Future Considerations
- **Premium vendor tier**: Priority placement in search, featured badges, analytics dashboards — monthly subscription
- **Promoted listings**: Vendors pay to appear at top of category/city search results
- **Lead-gen add-on**: Vendors in underserved categories could pay for priority inquiry routing
- **Enterprise/corporate**: Custom pricing for corporate event planners with volume bookings

## Service Upgrade Triggers

### Supabase (upgrade first — critical)
- Free tier pauses database after 1 week of inactivity
- **Upgrade to Pro (£25/month)** on launch day — removes pause, adds backups, 8GB storage

### Resend
- Free tier: 100 emails/day
- **Upgrade to Starter (£20/month)** when reaching ~50–100 active users

### Vercel
- Free tier covers most early usage
- **Upgrade to Pro (£20/month)** when hitting bandwidth or serverless limits (likely much later)

## Competitive Pricing Comparison

| Platform | Customer Cost | Vendor Cost | Model |
|----------|--------------|-------------|-------|
| **Event Nest** | 2% service fee | 10% on confirmed booking | Pay on results |
| Bark | Free | £5–30 per lead (regardless of outcome) | Pay per lead |
| Poptop | Free | Commission on booking | Pay on results |
| AddToEvent | Free | Subscription + commission | Hybrid |
| Bridebook | Free | Directory listing fee | Pay for presence |
| Instagram | Free | Free (but no infrastructure) | DIY |
