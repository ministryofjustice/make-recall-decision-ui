import { NextFunction, Request, Response } from 'express'

export const setAnalyticsId = (req: Request, res: Response, next: NextFunction) => {
  // dummy ID for testing locally / automated tests
  res.locals.googleAnalyticsId = 'UA-123456789-00'
  if (res.locals.env === 'PRODUCTION' && res.locals.flags.flagExcludeFromAnalytics !== true) {
    res.locals.googleAnalyticsId = 'G-JD5W689LSX'
  }
  if (res.locals.env === 'PRE-PRODUCTION') {
    res.locals.googleAnalyticsId = 'G-4NZ883ZE66'
  }
  next()
}
