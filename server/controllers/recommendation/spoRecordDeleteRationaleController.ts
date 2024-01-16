import { NextFunction, Request, Response } from 'express'
import { getRecommendation, updateRecommendation, updateStatuses } from '../../data/makeDecisionApiClient'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { RecommendationDecorated } from '../../@types/api'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const { user } = res.locals
  const recommendation: RecommendationDecorated = await getRecommendation(String(recommendationId), user.token)

  res.locals = {
    ...res.locals,
    page: {
      id: 'recordDeleteRecommendationRationale',
    },
    recommendation,
  }

  res.render(`pages/recommendations/recordDeleteRecommendationRationale`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { crn, sensitive } = req.body

  const {
    flags,
    urlInfo,
    user: { username, token, region },
  } = res.locals

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      sensitive: !!sensitive,
      sendSpoDeleteRationaleToDelius: true,
    },
    token,
    featureFlags: flags,
  })

  appInsightsEvent(EVENTS.MRD_DELETED_RECOMMENDATION, username, { crn, recommendationId, region }, flags)

  await updateStatuses({
    recommendationId,
    token,
    activate: [STATUSES.REC_CLOSED, STATUSES.REC_CANCELLED],
    deActivate: [],
  })

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'spo-delete-confirmation', urlInfo }))
}

export default { get, post }
