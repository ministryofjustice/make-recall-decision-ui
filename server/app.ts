import express from 'express'
import * as Sentry from '@sentry/node'

import path from 'path'
import createError from 'http-errors'
import cookieParser from 'cookie-parser'

import multer from 'multer'
import indexRoutes from './routes'
import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import standardRouter from './routes/standardRouter'
import type UserService from './services/userService'

import setUpWebSession from './middleware/setUpWebSession'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpAuthentication from './middleware/setUpAuthentication'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpSentry from './middleware/setUpSentry'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import authorisationMiddleware, { HMPPS_AUTH_ROLE } from './middleware/authorisationMiddleware'
import { metricsMiddleware } from './monitoring/metricsApp'
import { appInsightsOperationId } from './middleware/appInsightsOperationId'
import setUpCsrf from './middleware/setUpCsrf'
import { setupRecommendationStatusCheck } from './middleware/recommendationStatusCheck'
import { authorisationCheck } from './middleware/authorisationCheck'
import { hasRole } from './middleware/check'

export default function createApp(userService: UserService): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)
  app.use((req, res, next) => {
    res.locals.env = process.env.ENVIRONMENT // dev/ preprod / prod / TEST
    next()
  })
  app.use(cookieParser())
  app.use(setUpSentry())
  app.use(appInsightsOperationId)
  app.use(metricsMiddleware)
  app.use(setUpHealthChecks())
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app, path)
  app.use(setUpAuthentication())
  app.use(authorisationMiddleware)
  app.use(authorisationCheck(hasRole(HMPPS_AUTH_ROLE.PO)))
  app.use(setupRecommendationStatusCheck())

  // setup mime multipart file support - before csrf
  app.use(multer().single('file'))

  app.use(setUpCsrf())

  app.use('/', indexRoutes(standardRouter(userService)))

  app.use((req, res, next) => next(createError(404, 'Not found')))

  // The error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler())
  app.use(errorHandler())

  return app
}
