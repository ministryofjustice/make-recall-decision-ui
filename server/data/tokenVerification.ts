import type { Request } from 'express'
import { performance } from 'perf_hooks'
import { RestClient as HmppsRestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import { appInsightsTimingMetric } from '../monitoring/azureAppInsights'

function getApiClientToken(token: string) {
  const client = new HmppsRestClient('Token Verification API', config.apis.tokenVerification, logger)
  return client
    .post(
      {
        path: '/token/verify',
        timeout: config.apis.tokenVerification.timeout,
      },
      token,
    )
    .then(response => Boolean(response && (response as { active: boolean }).active))
    .catch(error => {
      logger.error(error, 'Error calling tokenVerificationApi')
    })
}

export type TokenVerifier = (request: Request) => Promise<boolean | void>

const tokenVerifier: TokenVerifier = async request => {
  const { user, verified } = request

  if (!config.apis.tokenVerification.enabled) {
    logger.debug('Token verification disabled, returning token is valid')
    return true
  }

  if (verified) {
    return true
  }

  logger.debug(`token request for user "${user.username}'`)

  const startTime = performance.now()
  const result = await getApiClientToken(user.token)
  appInsightsTimingMetric({ name: 'getAuthToken', startTime })
  if (result) {
    request.verified = true
  }
  return result
}

export default tokenVerifier
