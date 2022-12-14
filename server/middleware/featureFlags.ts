import { NextFunction, Request, Response } from 'express'
import { FeatureFlagDefault, ObjectMap } from '../@types'

export const featureFlagsDefaults = {
  flagConsiderRecall: {
    label: 'Consider a recall',
    default: false,
  },
  flagVulnerabilities: {
    label: 'Case overview - vulnerabilities tab',
    default: false,
  },
  flagRecommendationsPageProd: {
    label: 'Recommendations list',
    default: false,
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
  flagRecommendationsPagePrototype: {
    label: 'Prototype - Recommendations list',
    default: false,
  },
  flagRecommendationPrototype: {
    label: 'Prototype - Make a recommendation',
    default: false,
  },
}

export const readFeatureFlags =
  (flags: ObjectMap<FeatureFlagDefault>) => (req: Request, res: Response, next: NextFunction) => {
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
