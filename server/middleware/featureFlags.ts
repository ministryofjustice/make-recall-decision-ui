import { NextFunction, Request, Response } from 'express'

import { isPastDateTime, isPreprodOrProd } from '../utils/utils'
import FeatureFlagService from '../services/featureFlagService'

export const featureFlagsDefaults = async () => {
  const ffService = new FeatureFlagService()
  const flags = await ffService.getAll()
  const uiFlags = flags
    .filter(flag => flag.key.startsWith('ui-'))
    .map(flag => ({
      ...flag,
      // remove the `ui-` prefix before doing anything with it
      key: flag.key.replace('ui-', ''),
    }))
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
  const flags = await featureFlagsDefaults()
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
