import { NextFunction, Request, Response } from 'express'
import config from '../../config'

function get(req: Request, res: Response, next: NextFunction) {
  res.locals.notification = {
    ...config.notification,
    isVisible: config.notification.body && config.notification.active,
  }
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'sensitiveInformation',
    },
    link: `${config.domain}/recommendations/${recommendation.id}/`,
  }

  res.render(`pages/recommendations/sensitiveInformation`)
  next()
}

export default { get }
