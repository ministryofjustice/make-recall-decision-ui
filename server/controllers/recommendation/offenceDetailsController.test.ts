import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { updatePageReviewedStatus } from '../recommendations/helpers/updatePageReviewedStatus'
import offenceDetailsController from './offenceDetailsController'
import { fetchAndTransformLicenceConditions } from '../recommendations/licenceConditions/transform'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../recommendations/licenceConditions/transform')
jest.mock('../recommendations/helpers/updatePageReviewedStatus')

describe('get', () => {
  it('load with no data', async () => {
    ;(fetchAndTransformLicenceConditions as jest.Mock).mockResolvedValue('XYZ')
    ;(updateRecommendation as jest.Mock).mockResolvedValue('ABC')
    const res = mockRes({
      locals: {
        recommendation: { id: '123', personOnProbation: { name: 'Harry Smith' } },
      },
    })
    const next = mockNext()
    await offenceDetailsController.get(
      mockReq({
        params: { recommendationId: '123' },
      }),
      res,
      next
    )

    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: {},
      propertyToRefresh: 'convictionDetail',
      recommendationId: '123',
      token: 'token',
    })

    expect(updatePageReviewedStatus).toHaveBeenCalledWith({
      recommendationId: '123',
      reviewedProperty: 'convictionDetail',
      token: 'token',
    })

    expect(res.locals.page).toEqual({ id: 'offenceDetails' })
    expect(res.locals.recommendation).toEqual('ABC')
    expect(res.locals.caseSummary).toEqual('XYZ')
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/offenceDetails')
    expect(next).toHaveBeenCalled()
  })
})
