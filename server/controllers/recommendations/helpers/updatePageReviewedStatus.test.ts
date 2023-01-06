import { updatePageReviewedStatus } from './updatePageReviewedStatus'
import { updateRecommendation } from '../../../data/makeDecisionApiClient'

jest.mock('../../../data/makeDecisionApiClient')

describe('updatePageReviewedStatus', () => {
  const recommendationId = '123'
  const token = '456abc'

  it('updates the status if reviewedProperty is supplied', async () => {
    await updatePageReviewedStatus({
      reviewedProperty: 'previousRecalls',
      recommendationId,
      token,
    })
    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId,
      valuesToSave: { hasBeenReviewed: { previousRecalls: true } },
      token,
    })
  })

  it('updates the status for MAPPA page', async () => {
    await updatePageReviewedStatus({
      reviewedProperty: 'mappa',
      recommendationId,
      token,
    })
    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId,
      valuesToSave: { hasBeenReviewed: { mappa: true } },
      token,
    })
  })

  it('does not update the status if reviewedProperty is not supplied', async () => {
    await updatePageReviewedStatus({
      recommendationId,
      token,
    })
    expect(updateRecommendation).not.toHaveBeenCalled()
  })
})
