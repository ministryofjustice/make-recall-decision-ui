import { NextFunction, Request, Response } from 'express'
import { ObjectMap } from '../@types'

export const featureFlagDefaults = {
  collapsibleNotes: false,
}

export const readFeatureFlags = (flags: ObjectMap<boolean>) => (req: Request, res: Response, next: NextFunction) => {
  res.locals.flags = { ...flags }
  Object.keys(flags).forEach(key => {
    if (req.query[key]) {
      res.locals.flags[key] = req.query[key] === '1'
    }
  })
  next()
}
