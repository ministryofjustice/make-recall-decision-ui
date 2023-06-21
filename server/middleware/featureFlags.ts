import { NextFunction, Request, Response } from 'express'

import { FeatureFlagDefault } from '../@types/featureFlags'
import { isPreprodOrProd } from '../utils/utils'

export const featureFlagsDefaults = {
  flagTriggerWork: {
    label: 'Trigger Work',
    description: 'POs enter a new workflow over considering a recall, and then share a link with the SPO.',
    default: true,
  },
  flagConsiderRecall: {
    label: 'Consider a recall / manager decision',
    description:
      'POs can enter a "Consider a recall" rationale. They are then blocked from progressing past the "Review with a manager" page until an SPO records their decision.',
    default: false,
  },
  flagDomainEventRecommendationStarted: {
    label: 'Create NDelius contact when user creates a recommendation',
    description: 'Adds a contact in NDelius when a new recommendation is created',
    default: false,
  },
  flagRecommendationsPage: {
    label: 'Recommendations tab',
    description:
      'Shows a "Recommendations" tab in Case summary, with a list of all recommendations that have been created for that CRN',
    default: false,
  },
  flagDeleteRecommendation: {
    label: 'Allow deletion of a recommendation',
    description:
      'Development team use only - shows links on the Recommendations tab allowing any recommendation to be marked as deleted. Deleting a recommendation allows a new one to be created, if needed. The "deleted" recommendation will be retained in the database, and no data or audit info will be lost.',
    default: false,
  },
  flagExcludeFromAnalytics: {
    label: "Don't send events to Google Analytics or App Insights for my activity",
    default: false,
    description:
      'Development team use only - allows you to browse and use the product without creating analytics data. Note - audit data will still be created.',
  },
  flagCreateVaryLicenceData: {
    label: "Show tab for 'Create & vary a licence' data",
    description:
      'Development team use only - shows a tab on the Case summary showing data from the "Create & vary a licence" service',
    default: false,
  },
}

export const readFeatureFlags =
  (flags: Record<string, FeatureFlagDefault>) => (req: Request, res: Response, next: NextFunction) => {
    res.locals.flags = Object.keys(flags).reduce((acc, key) => {
      acc[key] = flags[key].default
      return acc
    }, {})
    Object.keys(flags).forEach(key => {
      const flag = req.query[key] || req.cookies[key]
      const featureFlagEnabledDefaultvalue = !isPreprodOrProd(process.env.ENVIRONMENT)
      const userFeatureFlagSettingAllowed =
        typeof process.env.FEATURE_FLAG_QUERY_PARAMETERS_ENABLED === 'undefined'
          ? featureFlagEnabledDefaultvalue
          : process.env.FEATURE_FLAG_QUERY_PARAMETERS_ENABLED
      if (userFeatureFlagSettingAllowed.toString() === 'true' && flag) {
        const enabled = flag === '1'
        res.cookie(key, flag)
        res.locals.flags[key] = enabled
      }
    })
    next()
  }
