import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions — enough for performance data without volume costs
  replaysOnErrorSampleRate: 1.0, // Full session replay on errors
  replaysSessionSampleRate: 0.01, // 1% of normal sessions
  integrations: [
    Sentry.replayIntegration(),
  ],
})
