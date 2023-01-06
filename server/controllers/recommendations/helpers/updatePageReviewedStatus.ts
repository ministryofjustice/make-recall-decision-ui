import { updateRecommendation } from '../../../data/makeDecisionApiClient'

export const updatePageReviewedStatus = async ({
  reviewedProperty,
  recommendationId,
  token,
}: {
  reviewedProperty?: string
  recommendationId: string
  token: string
}) => {
  if (reviewedProperty) {
    const valuesToSave = { hasBeenReviewed: {} }
    valuesToSave.hasBeenReviewed[reviewedProperty] = true
    await updateRecommendation({ recommendationId, valuesToSave, token })
  }
}
