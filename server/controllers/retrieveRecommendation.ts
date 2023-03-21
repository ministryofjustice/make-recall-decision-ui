import { NextFunction, Request, Response } from 'express'
import { getRecommendation } from '../data/makeDecisionApiClient'
import { RecommendationDecorated } from '../@types/api'
import { isCaseRestrictedOrExcluded } from '../utils/utils'
import { routeUrls } from '../routes/routeUrls'

export default async function retrieveRecommendation(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params

  const {
    user: { token },
  } = res.locals

  const recommendation = (await getRecommendation(recommendationId, token)) as RecommendationDecorated

  if (isCaseRestrictedOrExcluded(recommendation.userAccessResponse)) {
    res.locals.caseSummary = recommendation
    return res.render('pages/excludedRestrictedCrn')
  }

  if (recommendation.status === 'DOCUMENT_DOWNLOADED') {
    return res.redirect(301, `${routeUrls.cases}/${recommendation.crn}/overview`)
  }

  res.locals.recommendation = recommendation
  next()
}
