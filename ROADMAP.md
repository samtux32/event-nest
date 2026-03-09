# Event Nest — 10k Users Roadmap

## Critical — Performance
- [ ] 1. Database indexes on frequently queried fields
- [ ] 2. Pagination (marketplace, messages, bookings, conversations)
- [ ] 3. Supabase Realtime for messaging (replace polling)
- [ ] 4. Paid geocoding API (replace Nominatim)
- [ ] 5. Image compression/optimization + CDN

## Critical — Revenue
- [ ] 6. Stripe payment integration
- [ ] 7. Cancellation policy (flexible/moderate/strict + automatic refunds via Stripe)

## High — Reliability
- [ ] 8. Error monitoring (Sentry)
- [ ] 9. Rate limiting on API routes
- [ ] 10. Input sanitization audit

## High — UX
- [ ] 11. Push notifications (PWA)
- [ ] 12. Proper search and filtering (full-text, price range, availability)
- [ ] 13. Unsend messages in chat
- [ ] 14. Block contact info in messages until booking confirmed
- [ ] 15. Update/cancel booking (tied to cancellation policy)
- [ ] 16. Request invoice (via Stripe)
- [ ] 17. Clickable dashboard stats with detailed breakdowns
- [ ] 18. "Become a Vendor" in customer settings

## Medium — Platform
- [ ] 19. Vendor approval flow (portal access but hidden until admin approves)
- [ ] 20. Vendor verification system
- [ ] 21. Admin/moderation tools at scale
- [ ] 22. Automated tests for core flows

## Later Phase
- [ ] 23. Date availability filter + vendor availability calendar
