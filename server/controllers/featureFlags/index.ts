import { Request, Response } from 'express'
import { determineEnvFeatureOverride, featureFlagsDefaults } from '../../middleware/featureFlags'

const getFeatureFlags = async (req: Request, res: Response): Promise<Response | void> => {
  const featureFlags = await featureFlagsDefaults(res.locals.user)

  res.locals.flagsList = Object.keys(res.locals.flags)
    .sort((a, b) => a.localeCompare(b))
    .map(key => {
      const globallyEnabled = determineEnvFeatureOverride(key)
      const flag = featureFlags.find(val => val.key === key)
      return {
        id: key,
        label: flag.key,
        description: flag.description,
        default: flag.enabled,
        override: globallyEnabled || res.locals.flags[key],
        globallyEnabled,
      }
    })

  res.render('pages/featureFlags')
}

export default getFeatureFlags
