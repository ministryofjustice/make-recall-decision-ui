import express, { Router } from 'express'
import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'

export default function setUpSentry(): Router {
  const router = express.Router()

  Sentry.init({
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app: router }),
    ],
    ignoreErrors: ['AbortError', /^Invalid URL$/, /^Redis connection to/, 'Non-Error exception captured'],
    // Quarter of all requests will be used for performance sampling
    tracesSampler: samplingContext => {
      const transactionName =
        samplingContext && samplingContext.transactionContext && samplingContext.transactionContext.name

      if (transactionName && (transactionName.includes('ping') || transactionName.includes('health'))) {
        return 0
      }

      // Default sample rate
      return 0.05
    },
  })

  // RequestHandler creates a separate execution context using domains, so that every
  // transaction/span/breadcrumb is attached to its own Hub instance
  router.use(
    Sentry.Handlers.requestHandler({
      // Ensure we don't include `data` to avoid sending any PPI
      request: ['cookies', 'headers', 'method', 'query_string', 'url'],
      user: ['id', 'permissions'],
    })
  )

  // TracingHandler creates a trace for every incoming request
  router.use(Sentry.Handlers.tracingHandler())

  return router
}
