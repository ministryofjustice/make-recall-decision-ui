import { NextFunction, Request, Response } from 'express'

export const setAnalyticsId = (req: Request, res: Response, next: NextFunction) => {
  res.locals.googleTagManagerId = 'GTM-KT65J4V'
  next()
}
