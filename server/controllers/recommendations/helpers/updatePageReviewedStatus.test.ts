import { updatePageReviewedStatus } from './updatePageReviewedStatus'
import { updateRecommendation } from '../../../data/makeDecisionApiClient'

jest.mock('../../../data/makeDecisionApiClient')

describe('updatePageReviewedStatus', () => {
  const recommendationId = '123'
  const userToken = '456abc'

  it('updates the status if reviewedProperty is supplied', async () => {
    await updatePageReviewedStatus({
      reviewedProperty: 'previousRecalls',
      recommendationId,
      userToken,
    })
    expect(updateRecommendation).toHaveBeenCalledWith(
      recommendationId,
      { hasBeenReviewed: { previousRecalls: true } },
      userToken
    )
  })

  it('updates the status for MAPPA page', async () => {
    await updatePageReviewedStatus({
      reviewedProperty: 'mappa',
      recommendationId,
      userToken,
    })
    expect(updateRecommendation).toHaveBeenCalledWith(recommendationId, { hasBeenReviewed: { mappa: true } }, userToken)
  })

  it('does not update the status if reviewedProperty is not supplied', async () => {
    await updatePageReviewedStatus({
      recommendationId,
      userToken,
    })
    expect(updateRecommendation).not.toHaveBeenCalled()
  })
})
