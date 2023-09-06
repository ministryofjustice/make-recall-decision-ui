import { NextFunction, Request, Response } from 'express'
import config from '../../config'

function get(req: Request, res: Response, next: NextFunction) {
  res.locals.notification = {
    ...config.notification,
    isVisible: config.notification.body && config.notification.active,
  }
  const { recommendation } = res.locals

  const nextPageId =
    recommendation.isIndeterminateSentence || recommendation.isExtendedSentence
      ? 'recall-type-indeterminate'
      : 'recall-type'

  res.locals = {
    ...res.locals,
    page: {
      id: 'discussWithManager',
    },
    nextPageId,
  }

  res.render(`pages/recommendations/discussWithManager`)
  next()
}

export default { get }
