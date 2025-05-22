import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { updatePageReviewedStatus } from '../recommendations/helpers/updatePageReviewedStatus'
import offenceDetailsController from './offenceDetailsController'
import { fetchAndTransformLicenceConditions } from '../recommendations/licenceConditions/transform'
import raiseWarningBannerEvents from '../raiseWarningBannerEvents'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../recommendations/licenceConditions/transform')
jest.mock('../recommendations/helpers/updatePageReviewedStatus')
jest.mock('../raiseWarningBannerEvents')

describe('get', () => {
  it('load with no data', async () => {
    ;(fetchAndTransformLicenceConditions as jest.Mock).mockResolvedValue({
      licenceConvictions: {
        activeCustodial: [{}],
      },
      hasAllConvictionsReleasedOnLicence: true,
    })
    ;(updateRecommendation as jest.Mock).mockResolvedValue({ crn: 'ABC' })
    const res = mockRes({
      locals: {
        recommendation: { id: '123', personOnProbation: { name: 'Joe Bloggs' } },
        user: { username: 'bob', region: { code: 'X', name: 'Y' } },
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
    expect(res.locals.recommendation).toEqual({ crn: 'ABC' })
    expect(res.locals.caseSummary).toEqual({
      hasAllConvictionsReleasedOnLicence: true,
      licenceConvictions: { activeCustodial: [{}] },
    })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/offenceDetails')
    expect(next).toHaveBeenCalled()
    expect(raiseWarningBannerEvents).toHaveBeenCalledWith(
      1,
      true,
      {
        region: { code: 'X', name: 'Y' },
        username: 'bob',
      },
      'ABC',
      {}
    )
  })
})
