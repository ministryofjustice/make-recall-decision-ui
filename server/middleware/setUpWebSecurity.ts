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
            'www.smartsurvey.co.uk',
          ],
          connectSrc: [
            "'self'",
            'www.google-analytics.com',
            '*.google-analytics.com',
            '*.analytics.google.com',
            '*.applicationinsights.azure.com',
            '*.monitor.azure.com',
            // This removes sourcemap errors from the Probation Components API assets
            // normally handled by the package's CSP settings, but it seems this config
            // file is overwriting that, so we manually add it back in here
            config.apis.probationApi.url,
          ],
          imgSrc: [
            "'self'",
            'data:',
            '*.google-analytics.com',
            '*.analytics.google.com',
            '*.smartsurvey.co.uk',
            // The image we use for the SmartSurvey pop-up was taken from
            // brand.gov.uk. Can be removed once the survey is removed
            '*.brand.gov.uk',
          ],
          styleSrc: [
            "'self'",
            // unsafe-hashes and the three hashes below were added for the SmartSurvey pop-up added to
            // the request-spo-countersign page. Can be removed once the survey is removed
            "'unsafe-hashes'",
            "'sha256-v+hB44R3iMNw3SytNBSdcp6VH4zSKLWgsPe08xV/oPk='",
            "'sha256-qnVkQSG7pWu17hBhIw0kCpfEB3XGvt0mNRa6+uM6OUU='",
            "'sha256-9kro3v0dc6rZm7Gw6JoDGiu3Io0gvt9rQGk3H4LJXYU='",
          ],
          fontSrc: ["'self'"],
          formAction: [
            "'self'",
            'sign-in-dev.hmpps.service.justice.gov.uk',
            'sign-in-preprod.hmpps.service.justice.gov.uk',
            'sign-in.hmpps.service.justice.gov.uk',
          ],
        },
      },
    }),
  )
  router.use(helmet.crossOriginEmbedderPolicy({ policy: 'credentialless' }))
  return router
}
