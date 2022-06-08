import { NextFunction, Request, Response } from 'express'
import { ObjectMap } from '../@types'

export const featureFlagDefaults = {
  dateFilters: true,
  contactTypesFilter: false,
  flagSearchFilter: false,
  flagShowMockedUi: false,
}

export const readFeatureFlags = (flags: ObjectMap<boolean>) => (req: Request, res: Response, next: NextFunction) => {
  res.locals.flags = { ...flags }
  Object.keys(flags).forEach(key => {
    const flag = req.query[key] || req.cookies[key]
    if (flag) {
      const enabled = flag === '1'
      res.cookie(key, flag)
      res.locals.flags[key] = enabled
    }
  })
  next()
}
