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
      id: 'shareCaseWithManager',
    },
    link: `${config.domain}/recommendations/${recommendation.id}/spo-task-list-consider-recall`,
  }

  res.render(`pages/recommendations/shareCaseWithManager`)
  next()
}

export default { get }
