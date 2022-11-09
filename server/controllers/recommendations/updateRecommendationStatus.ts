import { Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { routeUrls } from '../../routes/routeUrls'
import { validateCrn } from '../../utils/utils'
import { RecommendationResponse } from '../../@types/make-recall-decision-api/models/RecommendationResponse'
import { AppError } from '../../AppError'

const isValidStatus = (status: string) => {
  const validValues = Object.values(RecommendationResponse.status) as string[]
  return validValues.includes(status)
}

export const updateRecommendationStatus = async (req: Request, res: Response): Promise<void> => {
  const { recommendationId } = req.params
  const { status, crn } = req.body
  const { user } = res.locals
  if (!isValidStatus(status)) {
    throw new AppError('Invalid status', { status: 400, errorType: 'INVALID_RECOMMENDATION_STATUS' })
  }
  const normalizedCrn = validateCrn(crn)
  await updateRecommendation(recommendationId, { status }, user.token)
  res.redirect(303, `${routeUrls.cases}/${normalizedCrn}/recommendations`)
}
