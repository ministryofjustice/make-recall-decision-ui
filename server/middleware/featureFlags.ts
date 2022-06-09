import { NextFunction, Request, Response } from 'express'
import { FeatureFlag, ObjectMap } from '../@types'

export const featureFlagsDefaults = {
  dateFilters: {
    label: 'Contacts date filter',
    default: true,
  },
  contactTypesFilter: {
    label: 'Contact types filter',
    default: false,
  },
  flagSearchFilter: {
    label: 'Contacts text search filter',
    default: false,
  },
  flagShowMockedUi: {
    label: 'Show UI that uses mocked data',
    default: false,
  },
}

export const readFeatureFlags =
  (flags: ObjectMap<FeatureFlag>) => (req: Request, res: Response, next: NextFunction) => {
    res.locals.flags = Object.keys(flags).reduce((acc, key) => {
      acc[key] = flags[key].default
      return acc
    }, {})
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
