import { NextFunction, Request, Response } from 'express'
import { updateRecommendation, updateStatuses } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'

async function get(_: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'apRecordDecision',
    },
    spoRecallRationale: recommendation.spoRecallRationale,
    inputDisplayValues: {
      errors: res.locals.errors,
    },
  }
  res.render(`pages/recommendations/apRecordDecision`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const { crn, sensitive } = req.body

  const {
    flags,
    user: { username, token, region },
    urlInfo,
  } = res.locals

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      sensitive: !!sensitive,
      sendSpoRationaleToDelius: true,
    },
    token,
    featureFlags: flags,
  })

  appInsightsEvent(EVENTS.MRD_SPO_RATIONALE_SENT, username, { crn, recommendationId, region }, flags)

  await updateStatuses({
    recommendationId,
    token,
    activate: [STATUSES.SPO_RECORDED_RATIONALE],
    deActivate: [STATUSES.SPO_CONSIDER_RECALL],
  })

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'ap-rationale-confirmation', urlInfo }))
}

export default { get, post }
