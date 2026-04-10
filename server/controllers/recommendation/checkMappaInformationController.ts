import { Request, NextFunction, Response } from 'express'
import { getCaseSummary, updateRecommendation } from '../../data/makeDecisionApiClient'
import { RiskResponse } from '../../@types/make-recall-decision-api'
import routeUrls from '../../routes/routeUrls'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import updatePageReviewedStatus from '../recommendations/helpers/updatePageReviewedStatus'

async function get(req: Request, res: Response, next: NextFunction) {
  const {
    recommendation,
    user: { token },
    flags,
  } = res.locals

  const { mappa: mappaData } = await getCaseSummary<RiskResponse>(recommendation.crn, 'risk', token, flags)

  res.locals = {
    ...res.locals,
    mappaData,
    page: {
      id: 'checkMappaInformation',
    },
  }

  res.render('pages/recommendations/checkMappaInformation')
  next()
}

async function post(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    urlInfo,
    flags: featureFlags,
    user: { token },
  } = res.locals

  const { _csrf, ...valuesToSave } = req.body

  await updateRecommendation({
    recommendationId,
    valuesToSave,
    token,
    featureFlags,
  })

  await updatePageReviewedStatus({
    reviewedProperty: 'ftr56MappaInformation',
    recommendationId,
    token,
  })

  const nextPagePath = `${routeUrls.recommendations}/${recommendationId}/suitability-for-fixed-term-recall`
  return res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
