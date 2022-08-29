import { NextFunction, Request, Response } from 'express'

export const setAnalyticsId = (req: Request, res: Response, next: NextFunction) => {
  // dummy ID for testing locally / automated tests
  res.locals.googleAnalyticsId = 'UA-123456789-00'
  if (res.locals.env === 'PRODUCTION' && res.locals.flags.flagExcludeFromAnalytics !== true) {
    res.locals.googleAnalyticsId = 'UA-106741063-23'
  }
  if (res.locals.env === 'PRE-PRODUCTION') {
    res.locals.googleAnalyticsId = 'UA-106741063-22'
  }
  next()
}
