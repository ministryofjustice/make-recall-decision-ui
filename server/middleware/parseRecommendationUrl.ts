import { NextFunction, Request, Response } from 'express'
import { isString } from '../utils/utils'
import { routeUrls } from '../routes/routeUrls'
import logger from '../../logger'

const isValidFromPage = (pageUrlSlug: unknown) => {
  const valid = isString(pageUrlSlug) && ['task-list', 'task-list-no-recall'].includes(pageUrlSlug as string)
  if (!valid) {
    logger.error(`isValidFromPage: invalid pageUrlSlug: ${pageUrlSlug}`)
  }
  return valid
}

export const parseRecommendationUrl = (req: Request, res: Response, next: NextFunction) => {
  const { recommendationId, pageUrlSlug } = req.params
  const { fromPageId, fromAnchor } = req.query
  res.locals.urlInfo = {
    ...res.locals.urlInfo,
    fromPageId: fromPageId && isValidFromPage(fromPageId) ? fromPageId : undefined,
    fromAnchor,
    currentPageId: pageUrlSlug,
    basePath: `${routeUrls.recommendations}/${recommendationId}/`,
  }
  next()
}
