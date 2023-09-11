import { NextFunction, Request, Response } from 'express'
import config from '../config'

export default function handleMaintenanceBanner(req: Request, res: Response, next: NextFunction) {
  res.locals.notification = {
    ...config.notification,
    isVisible: config.notification.active === 'true' && Boolean(config.notification.body),
  }
  next()
}
