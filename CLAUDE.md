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
