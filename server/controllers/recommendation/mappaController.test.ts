import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { updatePageReviewedStatus } from '../recommendations/helpers/updatePageReviewedStatus'
import mappaController from './mappaController'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../recommendations/helpers/updatePageReviewedStatus')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { id: '123', personOnProbation: { name: 'Harry Smith' } },
      },
    })
    const next = mockNext()
    await mappaController.get(
      mockReq({
        params: { recommendationId: '123' },
      }),
      res,
      next
    )

    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: {},
      propertyToRefresh: 'mappa',
      recommendationId: '123',
      token: 'token',
    })

    expect(updatePageReviewedStatus).toHaveBeenCalledWith({
      recommendationId: '123',
      reviewedProperty: 'mappa',
      token: 'token',
    })

    expect(res.locals.page).toEqual({ id: 'mappa' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/mappa')
    expect(next).toHaveBeenCalled()
  })
})
