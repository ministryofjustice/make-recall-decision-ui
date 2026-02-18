import express, { Response, Router } from 'express'
import helmet from 'helmet'
import { randomBytes } from 'crypto'
import config from '../config'

export default function setUpWebSecurity(): Router {
  const router = express.Router()

  router.use((req, res, next) => {
    res.locals.cspNonce = randomBytes(16).toString('hex')
    next()
  })
  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  router.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // Hash allows inline script pulled in from https://github.com/alphagov/govuk-frontend/blob/master/src/govuk/template.njk
          scriptSrc: [
            "'self'",
            "'sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw='",
            (req, res) => `'nonce-${(res as Response).locals.cspNonce}'`,
          ],
          connectSrc: [
            "'self'",
            'www.google-analytics.com',
            '*.google-analytics.com',
            '*.analytics.google.com',
            '*.applicationinsights.azure.com',
            // This removes sourcemap errors from the Probation Components API assets
            // normally handled by the package's CSP settings, but it seems this config
            // file is overwriting that, so we manually add it back in here
            config.apis.probationApi.url,
          ],
          imgSrc: ["'self'", 'data:', '*.google-analytics.com', '*.analytics.google.com'],
          styleSrc: ["'self'"],
          fontSrc: ["'self'"],
          formAction: [
            "'self'",
            'sign-in-dev.hmpps.service.justice.gov.uk',
            'sign-in-preprod.hmpps.service.justice.gov.uk',
            'sign-in.hmpps.service.justice.gov.uk',
          ],
        },
      },
    })
  )
  router.use(helmet.crossOriginEmbedderPolicy({ policy: 'credentialless' }))
  return router
}
