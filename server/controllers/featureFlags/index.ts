import { Request, Response } from 'express'
import { featureFlagsDefaults } from '../../middleware/featureFlags'

export const getFeatureFlags = async (req: Request, res: Response): Promise<Response | void> => {
  res.locals.flagsList = Object.keys(res.locals.flags).map(key => ({
    id: key,
    label: featureFlagsDefaults[key].label,
    description: featureFlagsDefaults[key].description,
    default: featureFlagsDefaults[key].default,
    override: res.locals.flags[key],
  }))
  res.render('pages/featureFlags')
}
