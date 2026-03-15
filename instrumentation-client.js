// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://51583bef7fefae977a533c357ca7a3cb@o4511014450233344.ingest.de.sentry.io/4511014494863440",

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.1,

  // Only replay on errors — saves bandwidth and respects privacy
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  // Do NOT send PII (email, IP) — GDPR compliance
  sendDefaultPii: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
