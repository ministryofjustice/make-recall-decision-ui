import { Request, Response } from 'express'
import { createRecommendation } from '../../data/makeDecisionApiClient'
import { validateCrn } from '../../utils/utils'
import { routeUrls } from '../../routes/routeUrls'

export const createRecommendationController = async (req: Request, res: Response): Promise<Response | void> => {
  const normalizedCrn = validateCrn(req.body.crn)
  try {
    await createRecommendation(normalizedCrn, res.locals.user.token)
  } catch (err) {
    req.session.errors = [
      {
        name: 'saveError',
        text: 'An error occurred creating a new recommendation',
      },
    ]
  } finally {
    res.redirect(303, `${routeUrls.cases}/${normalizedCrn}/overview`)
  }
}
