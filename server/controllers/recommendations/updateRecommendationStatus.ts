import { Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { routeUrls } from '../../routes/routeUrls'
import { normalizeCrn } from '../../utils/utils'

export const updateRecommendationStatus = async (req: Request, res: Response): Promise<void> => {
  const { recommendationId } = req.params
  const { status, crn } = req.body
  const { user } = res.locals
  const normalizedCrn = normalizeCrn(crn)
  await updateRecommendation(recommendationId, { status }, user.token)
  res.redirect(303, `${routeUrls.cases}/${normalizedCrn}/recommendations`)
}
