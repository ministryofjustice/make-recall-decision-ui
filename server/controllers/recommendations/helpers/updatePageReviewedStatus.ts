import { updateRecommendation } from '../../../data/makeDecisionApiClient'

export const updatePageReviewedStatus = async ({
  reviewedProperty,
  recommendationId,
  userToken,
}: {
  reviewedProperty?: string
  recommendationId: string
  userToken: string
}) => {
  if (reviewedProperty) {
    const valuesToSave = { hasBeenReviewed: {} }
    valuesToSave.hasBeenReviewed[reviewedProperty] = true
    await updateRecommendation(recommendationId, valuesToSave, userToken)
  }
}
