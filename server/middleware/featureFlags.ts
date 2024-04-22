import { NextFunction, Request, Response } from 'express'

import { FeatureFlagDefault } from '../@types/featureFlags'
import { isPreprodOrProd } from '../utils/utils'

export const featureFlagsDefaults: Record<string, FeatureFlagDefault> = {
  flagSupportingDocuments: {
    label: 'Enable Supporting Documents',
    description: 'Enables supporting documents',
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
}

export const readFeatureFlags =
  (flags: Record<string, FeatureFlagDefault>) => (req: Request, res: Response, next: NextFunction) => {
    res.locals.flags = Object.keys(flags).reduce((acc: Record<string, boolean>, key) => {
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
      const userFeatureFlagSettingAllowedAndFlagPresent = userFeatureFlagSettingAllowed.toString() === 'true' && flag
      if (userFeatureFlagSettingAllowedAndFlagPresent) {
        const enabled = flag === '1'
        res.cookie(key, flag)
        res.locals.flags[key] = enabled
      }
    })
    next()
  }
