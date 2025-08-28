import { NextFunction, Request, Response } from 'express'

import { FeatureFlagDefault } from '../@types/featureFlags'
import { isDateTimeAfterCurrent, isPreprodOrProd } from '../utils/utils'

export const featureFlagsDefaults: Record<string, FeatureFlagDefault> = {
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
  flagFtr48Updates: {
    label: 'Content updates for FTR48',
    description: 'Updates the recall suitability flow in line with the FTR48 changes.',
    default: false,
  },
}

export const determineEnvFeatureOverride = (key: string) => {
  const envFeatureFlag = process.env[`FEATURE_${key.toUpperCase()}`]
  return isDateTimeAfterCurrent(envFeatureFlag)
}

/**
 * Performs the following checks:
 * - See if there is an environment variables of the format FEATURE_{flagKey}
 *   Intended for environemnt releases, specifically production where the feature needs setting globally
 * - Searches both query params and cookie to see if either has flag key that enabled and if these permitted
 *   Intended for feature development and testing
 * The former check takes precedence over the latter so an environment feature that is enabled is aboslute,
 * when it is disabled however the locals settings and their validity are considered
 */
export const readFeatureFlags =
  (flags: Record<string, FeatureFlagDefault>) => (req: Request, res: Response, next: NextFunction) => {
    res.locals.flags = Object.keys(flags).reduce((acc: Record<string, boolean>, key) => {
      acc[key] = flags[key].default
      return acc
    }, {})
    Object.keys(flags).forEach(key => {
      const flag = req.query[key] || req.cookies[key]
      const featureOverride = determineEnvFeatureOverride(key)
      const featureFlagEnabledDefaultvalue = !isPreprodOrProd(process.env.ENVIRONMENT)
      const userFeatureFlagSettingAllowed =
        typeof process.env.FEATURE_FLAG_QUERY_PARAMETERS_ENABLED === 'undefined'
          ? featureFlagEnabledDefaultvalue
          : process.env.FEATURE_FLAG_QUERY_PARAMETERS_ENABLED
      const userFeatureFlagSettingAllowedAndFlagPresent = userFeatureFlagSettingAllowed.toString() === 'true' && flag
      if (featureOverride) {
        res.cookie(key, '1')
        res.locals.flags[key] = true
      } else if (userFeatureFlagSettingAllowedAndFlagPresent) {
        const enabled = flag === '1'
        res.cookie(key, flag)
        res.locals.flags[key] = enabled
      }
    })
    next()
  }
