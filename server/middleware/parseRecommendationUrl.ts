import { NextFunction, Request, Response } from 'express'
import { isString } from '../utils/utils'
import { routeUrls } from '../routes/routeUrls'

const isValidFromPage = (pageId: unknown) => isString(pageId) && ['task-list'].includes(pageId as string)

export const parseRecommendationUrl = (req: Request, res: Response, next: NextFunction) => {
  const { recommendationId, pageId } = req.params
  const { fromPageId, fromAnchor } = req.query
  res.locals.urlInfo = {
    ...res.locals.urlInfo,
    fromPageId: fromPageId && isValidFromPage(fromPageId) ? fromPageId : undefined,
    fromAnchor,
    currentPageId: pageId,
    basePath: `${routeUrls.recommendations}/${recommendationId}/`,
  }
  next()
}
