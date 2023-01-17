import { Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { routeUrls } from '../../routes/routeUrls'
import { validateCrn } from '../../utils/utils'
import { RecommendationResponse } from '../../@types/make-recall-decision-api/models/RecommendationResponse'
import { AppError } from '../../AppError'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'

const isValidStatus = (status: string) => {
  const validValues = Object.values(RecommendationResponse.status) as string[]
  return validValues.includes(status)
}

const getRedirectPath = (status: string, crn: string, recommendationId: string) => {
  switch (status) {
    case 'DELETED':
      return `${routeUrls.cases}/${crn}/recommendations`
    case 'DRAFT':
      return `${routeUrls.recommendations}/${recommendationId}/response-to-probation`
    default:
      return `${routeUrls.cases}/${crn}/overview`
  }
}
export const updateRecommendationStatus = async (req: Request, res: Response): Promise<void> => {
  const { recommendationId } = req.params
  const { status, crn } = req.body
  const {
    flags,
    user: { token, username },
  } = res.locals
  if (!isValidStatus(status)) {
    throw new AppError('Invalid status', { status: 400, errorType: 'INVALID_RECOMMENDATION_STATUS' })
  }
  const normalizedCrn = validateCrn(crn)
  await updateRecommendation({ recommendationId, valuesToSave: { status }, token })
  const redirectPath = getRedirectPath(status, normalizedCrn, recommendationId)
  res.redirect(303, redirectPath)
  if (status === 'DRAFT') {
    appInsightsEvent(
      EVENTS.MRD_RECOMMENDATION_STARTED,
      username,
      {
        crn: normalizedCrn,
        recommendationId,
      },
      flags
    )
  }
}
