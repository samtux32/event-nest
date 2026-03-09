# Event Nest - Codebase Audit Report
**Date:** 2026-03-09 (updated)
**Scope:** Full frontend + backend review

---

## Overall Result: PASS ✓
No critical bugs found. Code is production-ready.

---

## Backend API Routes

| Route | Status | Notes |
|-------|--------|-------|
| `POST /api/bookings` | ✓ | Creates booking + conversation + notification + email to vendor |
| `PUT /api/bookings` | ✓ | Vendor confirms/cancels + notifies customer + email on confirm |
| `GET /api/bookings` | ✓ | Role-aware, returns correct bookings per vendor/customer |
| `POST /api/conversations/[id]/quotes` | ✓ | Creates pending booking + quote + message + email to customer |
| `PATCH /api/quotes/[id]` | ✓ | Accept/decline + updates booking + emails both parties correctly |
| `POST /api/conversations/[id]/messages` | ✓ | Transaction-safe, unread count increments for OTHER party only |
| `GET /api/conversations` | ✓ | `nulls: 'last'` fix in place, proper ordering |
| `POST /api/bookings/[id]/propose-date` | ✓ | Transaction + notification + email to customer |
| `PATCH /api/bookings/[id]/propose-date` | ✓ | Notifies vendor + email on accept |
| `PUT /api/vendors/profile` | ✓ | Package deletion guarded with `Array.isArray()`, geocoding safe |
| `GET /api/vendors` | ✓ | Only returns approved vendors |
| `GET /api/vendors/[id]` | ✓ | Allows owner to preview unapproved profile |
| `POST /api/auth/register` | ✓ | Creates Supabase Auth + Prisma user + role profile |
| `GET /api/analytics` | ✓ | Handles division by zero, period comparisons correct |
| `POST /api/messages/upload` | ✓ | Uses service role key for Supabase Storage |
| Admin routes | ✓ | `requireAdmin()` helper used consistently |

---

## Frontend Components

| Component | Status | Notes |
|-----------|--------|-------|
| `AuthProvider.jsx` | ✓ | `refreshProfile()` available, listener cleaned up on unmount |
| `BookingRequest.jsx` | ✓ | Avatar uses email initial (not hardcoded), proper login redirect |
| `CustomerMarketplace.jsx` | ✓ | Geolocation, distance sorting, image fallbacks all in place |
| `BookingSummary.jsx` | ✓ | `responseTime` null-checked, image fallbacks present |
| `CustomerWishlist.jsx` | ✓ | Fetches wishlist + groups in parallel |
| `VendorPublicProfile.jsx` | ✓ | Quote/message/booking buttons inside scroll area |
| `QuoteForm.jsx` | ✓ | eventDate required field, sends to quotes endpoint |
| `QuoteAcceptModal.jsx` | ✓ | Simplified confirm dialog, PATCH to /api/quotes/[id] |
| All 35 components | ✓ | All imports verified — no broken references |

---

## Core Files

| File | Status | Notes |
|------|--------|-------|
| `middleware.js` | ✓ | All routes protected correctly, redirectTo preserved |
| `lib/email.js` | ✓ | Fire-and-forget, fallback values on all fields, localhost fallback |
| `lib/prisma.js` | ✓ | Singleton pattern for dev hot-reload |
| `lib/supabase/server.js` | ✓ | Cookie-based session handling |
| `lib/supabase/client.js` | ✓ | Browser client with anon key |

---

## Cross-Cutting Concerns

| Check | Result |
|-------|--------|
| `console.log` debug statements | ✓ None — only `console.error` in catch blocks |
| Hardcoded localhost URLs | ✓ None — all use `NEXT_PUBLIC_APP_URL \|\| 'http://localhost:3000'` |
| Hardcoded emails/IDs | ✓ None found |
| Secrets in code | ✓ None — all in `.env` |
| Unhandled promise rejections | ✓ None — all fire-and-forget use `.catch(() => {})` |
| Prisma transactions | ✓ Used correctly for all multi-step operations |
| Fee calculations | ✓ Consistent `Math.round(price * 0.10 * 100) / 100` throughout |
| Null safety | ✓ Optional chaining used throughout |

---

## Minor Notes (not bugs)

- `lib/email.js` silently returns if `RESEND_API_KEY` is missing — fine for dev, could add a `console.warn` later
- `/api/analytics` makes several sequential DB queries — readable now, could be optimised if it gets slow at scale
- Wishlist group vendor removal endpoint — works correctly, just worth a manual test

---

## Session 26 Security Additions

| Check | Result |
|-------|--------|
| Zod validation on all mutation routes | ✓ Added |
| Rate limiting (Upstash Redis) | ✓ Added — auth, messages, bookings, contact, AI |
| HTML injection in emails | ✓ Fixed — `escapeHtml()` on all user-interpolated values |
| SQL injection in vendor search | ✓ Fixed — parameterized `$queryRaw` |
| File upload extension allowlists | ✓ Added to all 3 upload routes |
| Checklist item ownership | ✓ Fixed — scoped to `checklistId` on update/delete |
| Data ownership audit (53 routes) | ✓ 51/53 already correct, 2 fixed |
| AI kill switch | ✓ `AI_ENABLED=false` env var disables AI planner only |

---

## Summary

**Auth/Authorization** — Solid. Consistent role checks on every route. All 53 routes audited.
**Data Validation** — Strong. Zod schemas on all mutation endpoints + file extension allowlists.
**Rate Limiting** — Upstash Redis on auth, messages, bookings, contact, AI routes.
**Error Handling** — Solid. All catch blocks return proper JSON error responses.
**Transactions** — Excellent. Used wherever multiple DB writes need to stay consistent.
**Emails** — Fully wired. 15+ triggers, all fire-and-forget, HTML-escaped, guarded by API key check.
**Middleware** — All routes protected correctly.

**Verdict: Production-ready.**
