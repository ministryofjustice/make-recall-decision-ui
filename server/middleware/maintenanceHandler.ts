import { NextFunction, Request, Response } from 'express'
import config from '../config'

export default function handleMaintenanceBanner(req: Request, res: Response, next: NextFunction) {
  res.locals.notification = {
    ...config.notification,
    isVisible: String(config.notification.active).toLowerCase() === 'true' && Boolean(config.notification.body),
  }
  next()
}
