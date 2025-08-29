import { Request, Response } from 'express'
import { determineEnvFeatureOverride, featureFlagsDefaults } from '../../middleware/featureFlags'

export const getFeatureFlags = async (req: Request, res: Response): Promise<Response | void> => {
  res.locals.flagsList = Object.keys(res.locals.flags).map(key => {
    const globalyEnabled = determineEnvFeatureOverride(key)
    return {
      id: key,
      label: featureFlagsDefaults[key].label,
      description: featureFlagsDefaults[key].description,
      default: featureFlagsDefaults[key].default,
      override: globalyEnabled || res.locals.flags[key],
      globalyEnabled,
    }
  })
  res.render('pages/featureFlags')
}
