import { Request, Response } from 'express'
import {
  createRecommendation,
  getActiveRecommendation,
  getStatuses,
  updateStatuses,
} from '../../data/makeDecisionApiClient'
import { validateCrn } from '../../utils/utils'
import { routeUrls } from '../../routes/routeUrls'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

export const createRecommendationController = async (req: Request, res: Response): Promise<Response | void> => {
  const normalizedCrn = validateCrn(req.body.crn)
  try {
    const { user, flags } = res.locals

    const activeRecommendation = await getActiveRecommendation(normalizedCrn, user.token, flags)

    if (activeRecommendation) {
      const statuses = (
        await getStatuses({
          recommendationId: String(activeRecommendation.recommendationId),
          token: user.token,
        })
      ).filter(status => status.active)

      const isPPDocumentCreated = statuses.find(status => status.name === STATUSES.PP_DOCUMENT_CREATED)
      if (!isPPDocumentCreated) {
        res.redirect(303, `${routeUrls.recommendations}/${activeRecommendation.recommendationId}/already-existing`)
        return
      }
    }
    const recommendation = await createRecommendation({ crn: normalizedCrn }, user.token, flags)
    await updateStatuses({
      recommendationId: String(recommendation.id),
      token: user.token,
      activate: [STATUSES.PO_START_RECALL],
      deActivate: [],
    })
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
