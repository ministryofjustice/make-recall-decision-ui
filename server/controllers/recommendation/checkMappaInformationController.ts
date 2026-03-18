import { Request, NextFunction, Response } from 'express'
import { getCaseSummary } from '../../data/makeDecisionApiClient'
import { RiskResponse } from '../../@types/make-recall-decision-api'
import routeUrls from '../../routes/routeUrls'

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
      nextPageId: `${routeUrls.recommendations}/${recommendation.id}/suitability-for-fixed-term-recall`,
    },
  }

  res.render('pages/recommendations/checkMappaInformation')
  next()
}

export default { get }
