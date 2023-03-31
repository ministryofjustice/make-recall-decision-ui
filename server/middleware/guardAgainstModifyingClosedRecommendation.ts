import { NextFunction, Request, Response } from 'express'
import { routeUrls } from '../routes/routeUrls'

export function guardAgainstModifyingClosedRecommendation(req: Request, res: Response, next: NextFunction) {
  const {
    recommendation,
    urlInfo: { currentPageId },
  } = res.locals

  if (currentPageId === 'confirmation-part-a') {
    return next()
  }

  if (currentPageId === 'confirmation-no-recall') {
    return next()
  }

  if (recommendation.status === 'DOCUMENT_DOWNLOADED') {
    res.redirect(301, `${routeUrls.cases}/${recommendation.crn}/overview`)
  }
  next()
}
