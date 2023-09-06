import { NextFunction, Request, Response } from 'express'
import config from '../../config'

function get(req: Request, res: Response, next: NextFunction) {
  res.locals.notification = {
    ...config.notification,
    isVisible: config.notification.body && config.notification.active,
  }
  res.locals = {
    ...res.locals,
    page: {
      id: 'confirmationPartA',
    },
  }

  res.render(`pages/recommendations/confirmationPartA`)
  next()
}

export default { get }
