import { updateRecommendation } from '../../../data/makeDecisionApiClient'

const reviewedProperty = (pageUrlSlug: string): string | undefined => {
  switch (pageUrlSlug) {
    case 'offence-details':
      return 'convictionDetail'
    case 'personal-details':
      return 'personOnProbation'
    default:
      return undefined
  }
}

export const updatePageReviewedStatus = async ({
  pageUrlSlug,
  recommendationId,
  userToken,
}: {
  pageUrlSlug: string
  recommendationId: string
  userToken: string
}) => {
  const propertyName = reviewedProperty(pageUrlSlug)
  if (propertyName) {
    const valuesToSave = { hasBeenReviewed: {} }
    valuesToSave.hasBeenReviewed[propertyName] = true
    await updateRecommendation(recommendationId, valuesToSave, userToken)
  }
}
