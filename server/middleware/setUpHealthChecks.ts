import express, { Router } from 'express'

import { monitoringMiddleware, endpointHealthComponent } from '@ministryofjustice/hmpps-monitoring'
import type { ApplicationInfo } from '../applicationInfo'
import logger from '../../logger'
import config from '../config'

export default function setUpHealthChecks(applicationInfo: ApplicationInfo): Router {
  const router = express.Router()

  const { hmppsAuth, makeRecallDecisionApi, tokenVerification } = config.apis

  const middleware = monitoringMiddleware({
    applicationInfo,
    healthComponents: [
      endpointHealthComponent(logger, 'hmppsAuth', hmppsAuth),
      endpointHealthComponent(logger, 'makeRecallDecisionApi', makeRecallDecisionApi),
      endpointHealthComponent(logger, 'tokenVerification', tokenVerification),
    ],
  })

  router.get('/health', middleware.health)
  router.get('/info', middleware.info)
  router.get('/ping', middleware.ping)

  return router
}
