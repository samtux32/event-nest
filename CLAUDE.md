# Event Nest — AI Agent Guide

## Critical Rules
- Use `createNotification()` / `createNotificationInTx()` from `@/lib/notifications` — never direct `prisma.notification.create`
- After `prisma db push` or `prisma generate`, restart the dev server — API routes silently fail on new fields
- Build script must be `prisma generate && next build` — omitting `prisma generate` breaks Vercel deploys
- Guard vendor packages with `Array.isArray(body.packages)` before syncing — prevents accidental deletion
- User lookup: try `findUnique({ where: { id } })` then fallback to `{ where: { email } }`
- Use `window.location.search` in useEffect — not `useSearchParams()` (unstable in Next.js 16 canary)
- Use `createPortal` to `document.body` for modals inside scroll containers (iOS Safari)
- 10MB file upload limit on all upload routes
- `git add -f public/sw.js` — the gitignore catches it on macOS
- All API routes must scope data access to the authenticated user — never allow modifying another user's data
- Keep everything in JS — no TypeScript files
- Don't add features or changes beyond what's explicitly requested

## Security
- All API calls go through Next.js `/api/*` routes — frontend never calls external services directly
- Input validation via zod schemas in `lib/validation/`
- HTML escaping via `escapeHtml()` in email templates — raw text stored in DB
- File upload validation with extension allowlists in `lib/sanitize.js`
- Rate limiting via Upstash Redis in `lib/rate-limit.js` (gracefully skips if not configured)
- SQL injection prevented — all search queries use Prisma parameterized queries
- AI kill switch: set `AI_ENABLED=false` in env vars to disable AI event planner without affecting the rest of the site

## Verification System
- `verificationStatus` field exists on both `VendorProfile` and `Document` models
- Enum values: `pending | verified | rejected` (NOT `unverified`)
- Auto-verification: when vendor saves profile with image + description + location + package AND is approved, status auto-sets to `verified`
- Admin can manually verify/un-verify in admin dashboard
- Verified badge (blue checkmark) shows on marketplace cards and vendor profile pages

## Cron Jobs (vercel.json)
- `/api/cron/complete-bookings` — daily 2am, auto-completes past bookings
- `/api/cron/event-reminders` — daily 9am, reminds about events in 3 days
- `/api/cron/profile-nudge` — weekly Monday 10am, emails vendors with incomplete profiles

## Route Groups (app directory)
- `(marketing)` — inspiration, help, contact, privacy, terms, vendor-signup
- `(auth)` — login, register, forgot-password, reset-password, auth/callback
- `(dashboard)` — my-events, my-bookings, messages, calendar, customer-settings, etc.
- `(vendor)` — portfolio, promotions, analytics, vendor-settings, profile-editor, etc.
- `(event-tools)` — compare, event-checklist, plan-my-event

## Documentation Index

| Task | Read these |
|------|-----------|
| Writing or editing code | `.claude/skills/rules.md` → `.claude/skills/project.md` |
| Marketing work | `.agents/product-marketing-context.md` → `skills/marketing.md` |
| Understanding the product | `ai-context/product.md` → `ai-context/workflows.md` |
| Business or strategy decisions | `ai-context/company.md` → `ai-context/strategy.md` → `ai-context/business-model.md` |
| Audience and positioning | `ai-context/audience.md` |
| Events and seasonal planning | `skills/events.md` |
| Partnerships and community | `skills/partnerships.md` |
| Growth and metrics | `skills/growth.md` |
| AI features and automation | `skills/ai-automation.md` |
