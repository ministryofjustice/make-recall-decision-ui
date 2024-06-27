import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'

async function get(_: Request, res: Response, next: NextFunction) {
  res.locals = {
    ...res.locals,
    page: {
      id: 'recordConsideration',
    },
  }

  res.render('pages/recommendations/recordConsiderationRationale')
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

  const event = EVENTS.MRD_SEND_CONSIDERATION_RATIONALE_TO_DELIUS

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      sendConsiderationRationaleToDelius: true,
      considerationSensitive: !!sensitive,
    },
    token,
    featureFlags: flags,
  })

  appInsightsEvent(event, username, { crn, recommendationId, region }, flags)

  res.redirect(303, nextPageLinkUrl({ nextPageId: 'share-case-with-manager', urlInfo }))
}

export default { get, post }
