import { NextFunction, Request, Response } from 'express'
import { isString } from '../utils/utils'
import { routeUrls } from '../routes/routeUrls'
import logger from '../../logger'

const isValidFromPage = (pageId: unknown) => {
  const valid = isString(pageId) && ['task-list', 'task-list-no-recall'].includes(pageId as string)
  if (!valid) {
    logger.error(`isValidFromPage: invalid pageId: ${pageId}`)
  }
  return valid
}

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
