import { Request, Response } from 'express'
import { createRecommendation } from '../../data/makeDecisionApiClient'
import { validateCrn } from '../../utils/utils'
import { routeUrls } from '../../routes/routeUrls'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'

export const createRecommendationController = async (req: Request, res: Response): Promise<Response | void> => {
  const normalizedCrn = validateCrn(req.body.crn)
  try {
    const { user, flags } = res.locals
    const recommendation = await createRecommendation({ crn: normalizedCrn }, user.token, flags)

    res.redirect(303, `${routeUrls.recommendations}/${recommendation.id}/`)

    appInsightsEvent(
      EVENTS.MRD_RECOMMENDATION_STARTED,
      res.locals.user.username,
      {
        crn: normalizedCrn,
        recommendationId: recommendation.id.toString(),
        region: user.region,
      },
      flags
    )
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
