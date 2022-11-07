import { Request, Response } from 'express'
import { createRecommendation } from '../../data/makeDecisionApiClient'
import { validateCrn } from '../../utils/utils'
import { routeUrls } from '../../routes/routeUrls'
import { trackEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'

export const createRecommendationController = async (req: Request, res: Response): Promise<Response | void> => {
  const normalizedCrn = validateCrn(req.body.crn)
  try {
    const recommendation = await createRecommendation(normalizedCrn, res.locals.user.token)
    res.redirect(303, `${routeUrls.recommendations}/${recommendation.id}/response-to-probation`)
    trackEvent(EVENTS.MRD_RECOMMENDATION_STARTED, normalizedCrn, res.locals.user.username)
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
