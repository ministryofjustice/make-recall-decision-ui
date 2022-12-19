import { Request, Response } from 'express'
import { createRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import { routeUrls } from '../../routes/routeUrls'
import { validateConsiderRecall } from './considerRecall/formValidator'
import logger from '../../../logger'
import { saveErrorWithDetails } from '../../utils/errors'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'
import { isPreprodOrProd, normalizeCrn } from '../../utils/utils'
import { AuditService } from '../../services/auditService'
import { RecommendationResponse } from '../../@types/make-recall-decision-api'

const auditService = new AuditService()

const sendEvents = ({
  crn,
  recommendationId,
  recommendation,
  username,
  env,
}: {
  crn: string
  recommendationId?: string
  recommendation: RecommendationResponse
  username: string
  env: string
}) => {
  const logErrors = isPreprodOrProd(env) && process.env.NODE_ENV !== 'test'
  const normalizedCrn = normalizeCrn(crn)
  if (recommendationId) {
    appInsightsEvent(EVENTS.MRD_CONSIDERATION_EDITED, username, {
      crn: normalizedCrn,
      recommendationId,
    })
    auditService.submitConsiderRecall({
      crn: normalizedCrn,
      recommendationId,
      username,
      logErrors,
    })
  } else {
    appInsightsEvent(EVENTS.MRD_RECOMMENDATION_STARTED, username, {
      crn: normalizedCrn,
      recommendationId: recommendation.id,
    })
    auditService.submitConsiderRecall({
      crn: normalizedCrn,
      recommendationId: recommendation.id.toString(),
      username,
      logErrors,
    })
  }
}

export const postConsiderRecall = async (req: Request, res: Response): Promise<Response | void> => {
  const { crn, recommendationId } = req.body
  try {
    const {
      env,
      flags,
      user: { username, token },
    } = res.locals
    const { errors, valuesToSave, unsavedValues, nextPagePath } = await validateConsiderRecall({
      requestBody: req.body,
      token,
    })
    let recommendation
    if (errors) {
      req.session.errors = errors
      req.session.unsavedValues = unsavedValues
      return res.redirect(303, nextPagePath)
    }
    if (recommendationId) {
      recommendation = await updateRecommendation(recommendationId, valuesToSave, token, flags)
    } else {
      recommendation = await createRecommendation(valuesToSave, token, flags)
    }
    res.redirect(303, nextPagePath)
    sendEvents({ crn: normalizeCrn(crn), recommendationId, recommendation, username, env })
  } catch (err) {
    if (err.name === 'AppError') {
      throw err
    }
    logger.error(err)
    req.session.errors = [saveErrorWithDetails({ err, isProduction: res.locals.env === 'PRODUCTION' })]
    res.redirect(303, `${routeUrls.cases}/${crn}/consider-recall`)
  }
}
