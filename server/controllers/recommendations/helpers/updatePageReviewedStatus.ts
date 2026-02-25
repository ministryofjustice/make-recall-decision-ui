import { updateRecommendation } from '../../../data/makeDecisionApiClient'

type ValuesToSaveType = {
  hasBeenReviewed: Record<string, boolean>
}

const updatePageReviewedStatus = async ({
  reviewedProperty,
  recommendationId,
  token,
}: {
  reviewedProperty?: string
  recommendationId: string
  token: string
}) => {
  if (reviewedProperty) {
    const valuesToSave: ValuesToSaveType = { hasBeenReviewed: {} }
    valuesToSave.hasBeenReviewed[reviewedProperty] = true
    await updateRecommendation({ recommendationId, valuesToSave, token })
  }
}

export default updatePageReviewedStatus
