import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://51583bef7fefae977a533c357ca7a3cb@o4511014450233344.ingest.de.sentry.io/4511014494863440',
  tracesSampleRate: 0.1,
})
