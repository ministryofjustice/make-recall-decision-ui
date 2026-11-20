import express, { Router } from 'express'
import { monitoringMiddleware, endpointHealthComponent } from '@ministryofjustice/hmpps-monitoring'

import logger from '../../logger'
import config from '../config'
import routes from '../../api/routes'

export default function setUpHealthChecks(): Router {
  const router = express.Router()

  const middleware = monitoringMiddleware({
    applicationInfo: {
      buildNumber: config.buildNumber,
      gitRef: config.gitRef,
      branchName: config.branchName,
      applicationName: config.applicationName,
      productId: config.productId,
    },
    healthComponents: [
      endpointHealthComponent(logger, 'hmppsAuth', {
        url: config.apis.hmppsAuth.url,
        healthPath: '/health/ping',
        agentConfig: config.apis.hmppsAuth.agent,
      }),
      endpointHealthComponent(logger, 'makeRecallDecisionApi', {
        url: config.apis.makeRecallDecisionApi.url,
        healthPath: routes.healthCheck,
        agentConfig: config.apis.makeRecallDecisionApi.agent,
      }),
      endpointHealthComponent(logger, 'tokenVerification', {
        url: config.apis.tokenVerification.url,
        healthPath: '/health/ping',
        agentConfig: config.apis.tokenVerification.agent,
        enabled: config.apis.tokenVerification.enabled,
      }),
    ],
  })

  router.get('/health', middleware.health)
  router.get('/info', middleware.info)
  router.get('/ping', middleware.ping)

  return router
}
