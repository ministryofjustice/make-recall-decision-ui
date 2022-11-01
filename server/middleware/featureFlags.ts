import { NextFunction, Request, Response } from 'express'
import { FeatureFlag, ObjectMap } from '../@types'

export const featureFlagsDefaults = {
  flagRecommendationProd: {
    label: 'Make a recommendation',
    default: true,
  },
  flagRecommendationsPageProd: {
    label: 'Recommendations list',
    default: false,
  },
  flagRecommendationsPagePrototype: {
    label: 'Prototype - Recommendations list',
    default: false,
  },
  flagRecommendationPrototype: {
    label: 'Prototype - Make a recommendation',
    default: false,
  },
  flagShowRiskTab: {
    label: 'Show Risk tab in case summary',
    default: true,
  },
  contactTypesFilter: {
    label: 'Contact types filter',
    default: true,
  },
  flagContactDocuments: {
    label: 'Show contact documents',
    default: true,
  },
  flagShowSystemGenerated: {
    label: 'Show system generated contacts',
    default: false,
  },
  flagExcludeFromAnalytics: {
    label: "Don't send my data to Google Analytics (in prod only)",
    default: false,
  },
  flagCreateVaryLicenceData: {
    label: "Show tab for 'Create & vary a licence' data",
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
