import { NextFunction, Request, Response } from 'express'
import { FeatureFlag, ObjectMap } from '../@types'

export const featureFlagsDefaults = {
  flagRecommendationProd: {
    label: 'Make a recommendation (production feature)',
    default: false,
  },
  flagRecommendationsPageProd: {
    label: 'Recommendations list (production feature)',
    default: false,
  },
  flagRecommendationsPagePrototype: {
    label: 'Recommendations list (prototype for user research)',
    default: false,
  },
  flagRecommendationPrototype: {
    label: 'Make a recommendation (prototype journey for user research)',
    default: false,
  },
  contactTypesFilter: {
    label: 'Contact types filter',
    default: false,
  },
  flagContactDocuments: {
    label: 'Show contact documents',
    default: false,
  },
  flagShowSystemGenerated: {
    label: 'Show system generated contacts',
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
