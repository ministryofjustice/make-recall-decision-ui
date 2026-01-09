import { NextFunction, Request, Response } from 'express'
import { isString } from '../utils/utils'
import logger from '../../logger'
import { sharedPaths } from '../routes/paths/shared.paths'

const isValidFromPage = (pageUrlSlug: unknown) => {
  const valid =
    isString(pageUrlSlug) &&
    [
      'task-list',
      'task-list-no-recall',
      'task-list-consider-recall',
      'spo-task-list-consider-recall',
      'rationale-check',
    ].includes(pageUrlSlug as string)
  if (!valid) {
    logger.error(`isValidFromPage: invalid pageUrlSlug: ${pageUrlSlug}`)
  }
  return valid
}

export const parseRecommendationUrl = (req: Request, res: Response, next: NextFunction) => {
  const { recommendationId } = req.params
  const { fromPageId, fromAnchor } = req.query
  const currentPageId = req.path.substring(req.path.lastIndexOf('/') + 1)
  res.locals.urlInfo = {
    ...res.locals.urlInfo,
    fromPageId: fromPageId && isValidFromPage(fromPageId) ? fromPageId : undefined,
    fromAnchor,
    currentPageId,
    basePath: `${sharedPaths.recommendations}/${recommendationId}/`,
  }
  next()
}
