import { NextFunction, Request, Response } from 'express'

export const setAnalyticsId = (req: Request, res: Response, next: NextFunction) => {
  if (res.locals.env !== 'PRODUCTION' || res.locals.flags.flagExcludeFromAnalytics !== true) {
    res.locals.googleTagManagerId = 'GTM-KT65J4V'
  }
  next()
}
