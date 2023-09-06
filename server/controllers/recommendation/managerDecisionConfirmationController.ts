import { NextFunction, Request, Response } from 'express'
import config from '../../config'

async function get(req: Request, res: Response, next: NextFunction) {
  res.locals.notification = {
    ...config.notification,
    isVisible: config.notification.body && config.notification.active,
  }
  res.locals = {
    ...res.locals,

    page: {
      id: 'managerDecisionConfirmation',
    },
  }
  res.render(`pages/recommendations/managerDecisionConfirmation`)
  next()
}

export default { get }
