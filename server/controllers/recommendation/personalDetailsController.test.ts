import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import personalDetailsController from './personalDetailsController'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { updatePageReviewedStatus } from '../recommendations/helpers/updatePageReviewedStatus'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../recommendations/helpers/updatePageReviewedStatus')

describe('get', () => {
  it('load with no data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue('XYZ')
    const res = mockRes({
      locals: {
        recommendation: { id: '123', personOnProbation: { name: 'Harry Smith' } },
      },
    })
    const next = mockNext()
    await personalDetailsController.get(
      mockReq({
        params: { recommendationId: '123' },
      }),
      res,
      next
    )

    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: {},
      propertyToRefresh: 'personOnProbation',
      recommendationId: '123',
      token: 'token',
    })

    expect(updatePageReviewedStatus).toHaveBeenCalledWith({
      recommendationId: '123',
      reviewedProperty: 'personOnProbation',
      token: 'token',
    })

    expect(res.locals.page).toEqual({ id: 'personalDetails' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/personalDetails')
    expect(res.locals.recommendation).toEqual('XYZ')
    expect(next).toHaveBeenCalled()
  })
})
