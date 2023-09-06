import { NextFunction, Request, Response } from 'express'
import config from '../../config'

async function get(req: Request, res: Response, next: NextFunction) {
  res.locals.notification = {
    ...config.notification,
    isVisible: config.notification.body && config.notification.active,
  }
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'confirmationNoRecallLetter',
    },
    recommendation,
  }

  res.render(`pages/recommendations/confirmationNoRecallLetter`)
  next()
}

export default { get }
