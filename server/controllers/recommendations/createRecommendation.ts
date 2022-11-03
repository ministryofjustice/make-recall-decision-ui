import { Request, Response } from 'express'
import { createRecommendation } from '../../data/makeDecisionApiClient'
import { validateCrn } from '../../utils/utils'
import { routeUrls } from '../../routes/routeUrls'
import { trackEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'
import logger from '../../../logger'

export const createRecommendationController = async (req: Request, res: Response): Promise<Response | void> => {
  const normalizedCrn = validateCrn(req.body.crn)
  try {
    logger.info(`About to track the MRD_RECOMMENDATION_STARTED event to app insights`)
    trackEvent(EVENTS.MRD_RECOMMENDATION_STARTED, req)
    const recommendation = await createRecommendation(normalizedCrn, res.locals.user.token)
    res.redirect(303, `${routeUrls.recommendations}/${recommendation.id}/response-to-probation`)
  } catch (err) {
    req.session.errors = [
      {
        name: 'saveError',
        text: 'An error occurred creating a new recommendation',
      },
    ]
    res.redirect(303, `${routeUrls.cases}/${normalizedCrn}/overview`)
  }
}
