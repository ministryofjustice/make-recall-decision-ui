import { NextFunction, Request, Response } from 'express'

import { isPastDateTime, isPreprodOrProd } from '../utils/utils'
import FeatureFlagService from '../services/featureFlagService'
import { HmppsAuthUser } from '../@types/make-recall-decision-api/models/hmpps-auth/User'

const featureFlagDescriptions: Record<string, string> = {
  flagDeleteRecommendation:
    'Development team use only - shows links on the Recommendations tab allowing any recommendation to be marked as deleted. Deleting a recommendation allows a new one to be created, if needed. The "deleted" recommendation will be retained in the database, and no data or audit info will be lost.',
  flagRecommendationsPage:
    'Shows a "Recommendations" tab in Case summary, with a list of all recommendations that have been created for that CRN',
  ftr56SentenceConviction:
    'Enables the updated version of the suitability question regarding new offences for Adult SDS sentences.',
}

export const featureFlagsDefaults = async (user: HmppsAuthUser) => {
  const ffService = new FeatureFlagService(user)
  const flags = await ffService.getAll()
  const uiFlags = flags
    .filter(flag => flag.key.startsWith('ui-'))
    .map(flag => {
      const newKey = flag.key.replace('ui-', '')

      return {
        ...flag,
        // remove the `ui-` prefix before doing anything with it
        key: newKey,
        description: featureFlagDescriptions?.[newKey],
      }
    })
  return uiFlags
}

export const determineEnvFeatureOverride = (key: string) => {
  const envFeatureFlag = process.env[`FEATURE_${key.toUpperCase()}`]
  return isPastDateTime(envFeatureFlag)
}

/**
 * Performs the following checks:
 * - See if there is an environment variables of the format FEATURE_{flagKey}
 *   Intended for environment releases, specifically production where the feature needs setting globally
 * - Searches both query params and cookie to see if either has flag key that enabled and if these permitted
 *   Intended for feature development and testing
 * The former check takes precedence over the latter so an environment feature that is enabled is absolute,
 * when it is disabled however the locals settings and their validity are considered
 */
export const readFeatureFlags = () => async (req: Request, res: Response, next: NextFunction) => {
  const flags = await featureFlagsDefaults(res.locals.user)
  const formattedFlags = flags.reduce(
    (acc, flag) => ({
      ...acc,
      [flag.key]: flag.enabled,
    }),
    {},
  )

  res.locals.flags = formattedFlags

  Object.keys(formattedFlags).forEach(key => {
    const flag = req.query[key] || req.cookies[key]
    const featureOverride = determineEnvFeatureOverride(key)
    const featureFlagEnabledDefaultValue = !isPreprodOrProd(process.env.ENVIRONMENT)
    const userFeatureFlagSettingAllowed =
      typeof process.env.FEATURE_FLAG_QUERY_PARAMETERS_ENABLED === 'undefined'
        ? featureFlagEnabledDefaultValue
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
