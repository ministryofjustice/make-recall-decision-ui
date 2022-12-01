import { updatePageReviewedStatus } from './updatePageReviewedStatus'
import { updateRecommendation } from '../../../data/makeDecisionApiClient'

jest.mock('../../../data/makeDecisionApiClient')

describe('updatePageReviewedStatus', () => {
  const recommendationId = '123'
  const userToken = '456abc'

  it('updates the status for personal details page', async () => {
    await updatePageReviewedStatus({
      pageUrlSlug: 'personal-details',
      recommendationId,
      userToken,
    })
    expect(updateRecommendation).toHaveBeenCalledWith(
      recommendationId,
      { hasBeenReviewed: { personOnProbation: true } },
      userToken
    )
  })

  it('updates the status for offence details page', async () => {
    await updatePageReviewedStatus({
      pageUrlSlug: 'offence-details',
      recommendationId,
      userToken,
    })
    expect(updateRecommendation).toHaveBeenCalledWith(
      recommendationId,
      { hasBeenReviewed: { convictionDetail: true } },
      userToken
    )
  })

  it('updates the status for MAPPA page', async () => {
    await updatePageReviewedStatus({
      pageUrlSlug: 'mappa',
      recommendationId,
      userToken,
    })
    expect(updateRecommendation).toHaveBeenCalledWith(recommendationId, { hasBeenReviewed: { mappa: true } }, userToken)
  })

  it('does not update the status for an unrecognised page', async () => {
    await updatePageReviewedStatus({
      pageUrlSlug: 'task-list',
      recommendationId,
      userToken,
    })
    expect(updateRecommendation).not.toHaveBeenCalled()
  })
})
