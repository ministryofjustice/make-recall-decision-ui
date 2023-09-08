import { NextFunction, Request, Response } from 'express'
import config from '../config'

export default function handleMaintenanceBanner(req: Request, res: Response, next: NextFunction) {
  res.locals.notification = {
    ...config.notification,
    isVisible: Boolean(config.notification.active === 'true'.toLowerCase()) && Boolean(config.notification.body),
  }
  next()
}
