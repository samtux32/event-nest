# Development Rules

## Code Style

### JavaScript
- **ES2020+** syntax — use `async/await`, optional chaining (`?.`), nullish coalescing (`??`)
- **camelCase** for variables and functions (`createNotification`, `sendPushToUser`)
- **PascalCase** for React components (`VendorDashboard`, `QuoteAcceptModal`)
- **UPPER_SNAKE_CASE** for environment variables and constants
- No TypeScript — this is a plain JavaScript project
- Use `"use client"` directive only on components that need browser APIs, state, or effects
- All imports use the `@/` path alias (e.g., `@/lib/prisma`, `@/components/ConfirmModal`)

### Responses
- API success: `NextResponse.json({ data })` or `NextResponse.json({ items, hasMore })`
- API error: `NextResponse.json({ error: 'message' }, { status: code })`
- Never throw in utility functions (`lib/email.js`, `lib/push.js`) — use try/catch and log errors silently

### Styling
- **Tailwind CSS only** — no CSS modules, no styled-components
- Primary brand colour: `purple-600` (`#7c3aed`)
- Responsive: mobile-first with `sm:`, `md:`, `lg:` breakpoints
- iOS Safari compatibility: use `createPortal` to `document.body` for modals inside scroll containers

## File Organization

```
app/
  api/[resource]/route.js      # REST endpoints grouped by resource
  [page-name]/page.js          # Page routes (thin wrappers around components)
components/
  [ComponentName].jsx          # One component per file, PascalCase naming
lib/
  [utility].js                 # Shared server utilities (prisma, email, push, notifications)
  supabase/                    # Supabase client variants (server, client, middleware)
hooks/
  use[HookName].js             # Custom React hooks
prisma/
  schema.prisma                # Single schema file for all models
scripts/
  [script-name].js             # Admin and utility scripts (run with node)
content/
  [page].md                    # Static markdown content (help, terms, privacy)
public/
  [asset]                      # Static files (favicons, manifest, service worker)
```

### Conventions
- Page routes (`app/*/page.js`) should be thin — import and render the corresponding component
- API routes go in `app/api/[resource]/route.js` with named exports (`GET`, `POST`, `PUT`, `DELETE`)
- Dynamic segments use `[id]` folders (e.g., `app/api/bookings/[id]/route.js`)
- No `src/` directory — everything lives at project root

## Adding New Features

### New API Endpoint
1. Create `app/api/[resource]/route.js`
2. Auth check: `const supabase = await createClient()` → `supabase.auth.getUser()`
3. User lookup: try `findUnique({ where: { id } })`, fallback to `{ where: { email } }`
4. Use Prisma for all database operations
5. Return `NextResponse.json()` with appropriate status codes
6. Add pagination with `limit`/`offset` if returning lists (cap `limit` at 100, fetch `limit + 1` for `hasMore`)

### New Page
1. Create `app/[page-name]/page.js` (server component, thin wrapper)
2. Create `components/[PageComponent].jsx` with `"use client"` if interactive
3. Add route to `middleware.js` public prefixes if it should be accessible without auth
4. Add appropriate header component (`PublicHeader`, `AppHeader`, etc.)

### New Database Model
1. Add model to `prisma/schema.prisma` with proper relations
2. Run `npx prisma db push` to sync schema
3. Run `npx prisma generate` to update client
4. **Restart the dev server** — API routes silently fail on new fields without restart

### Notifications
- **Always use** `createNotification()` from `@/lib/notifications` — never `prisma.notification.create` directly
- Use `createNotificationInTx(tx, ...)` inside Prisma transactions
- These helpers create the DB record AND fire Web Push automatically

### Emails
- Add new templates to `lib/email.js` following the existing pattern
- All email functions are fire-and-forget (catch errors internally, never throw)
- FROM address: `Event Nest <notifications@eventnestgroup.com>`

### File Uploads
- Enforce 10MB size limit on all upload routes
- Store files in Supabase Storage
- Return public URL in response

## Testing Requirements

### Current State
- No automated test suite exists — testing is manual
- Helper scripts exist in `scripts/` for specific flows (`test-email.mjs`, `test-quote-flow.mjs`)

### Manual Testing Checklist
- Test both customer and vendor flows for any booking/messaging changes
- Test on mobile viewport (iOS Safari is the primary mobile target)
- Verify notifications fire on all three channels (in-app, push, email)
- After schema changes: restart dev server, verify API routes return new fields
- Test auth edge cases: expired session, wrong role accessing protected route

### Demo Data
- Run `node scripts/seed-demo.js` to create realistic test data
- Run `node scripts/clean-demo.js` to remove demo accounts
- Demo accounts use `@eventnest-demo.com` emails — they exist in Prisma only, not Supabase Auth (can't log in as them)

## Documentation Expectations
- Update `MEMORY.md` session history after completing significant work
- Update `user-journeys.md` when features affecting user flows are built or fixed
- No JSDoc or inline comments required unless logic is non-obvious
- Keep `middleware.js` public prefix list updated when adding new public routes

## Things to Avoid

### Database
- **Never use direct `prisma.notification.create()`** — always use `createNotification()` or `createNotificationInTx()`
- **Never skip `prisma generate` in the build script** — Vercel will deploy a stale Prisma client
- **Never forget to restart the dev server** after `prisma db push` or `prisma generate`
- **Never use the direct DB host** (`db.xxx.supabase.co`) — it doesn't resolve; use the session pooler (`aws-1-eu-west-2.pooler.supabase.com`)

### Auth
- **Never trust client-side role checks alone** — always verify on the server via `supabase.auth.getUser()`
- **Never assume user exists in Prisma by Supabase ID** — always fallback to email lookup
- **Never expose `SUPABASE_SERVICE_ROLE_KEY`** to the client — it bypasses Row Level Security

### API
- **Never delete vendor packages unconditionally on profile save** — guard with `Array.isArray(body.packages)` check
- **Never return unbounded queries** — always paginate with `take` and `skip`
- **Never throw errors in email/push utilities** — they should fail silently with `console.error`

### Frontend
- **Never use `useSearchParams()` directly** — it's unstable in Next.js 16 canary; use `window.location.search` in `useEffect`
- **Never render modals inside scroll containers on iOS** — use `createPortal` to `document.body`
- **Never sort by nullable `lastMessageAt` without `nulls: 'last'`** — null values break ordering

### Deployment
- **Never deploy without `NEXT_PUBLIC_APP_URL` set in Vercel** — email links and OG tags break
- **Never commit `.env` or `.env.local`** — secrets must stay out of version control
- **Never forget `git add -f public/sw.js`** — the `Public/` gitignore rule (case-insensitive on macOS) excludes it
- **Never skip the `prisma generate && next build`** build command — omitting `prisma generate` causes silent field resolution failures in production
