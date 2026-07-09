import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import previousReleasesController from './previousReleasesController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with existing data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue({
      releaseUnderECSL: true,
      dateOfRelease: '2001-01-02',
      conditionalReleaseDate: '2003-04-05',
    })

    const req = mockReq({
      params: { recommendationId: '123' },
    })

    const res = mockRes({
      locals: {
        flags: {},
      },
    })

    await previousReleasesController.get(req, res, mockNext())

    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: {},
      propertyToRefresh: 'previousReleases',
      recommendationId: '123',
      token: 'token',
    })

    expect(res.locals.page.id).toBe('releaseDetails')
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/releaseDetails')
  })
})

describe('post', () => {
  it('post continue', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: {
        recommendationId: '123',
      },
      body: {
        continueButton: '1',
        dateOfRelease: '2026-01-01',
      },
    })

    const res = mockRes({
      token: 'token',
      locals: {
        flags: {},
      },
    })

    await previousReleasesController.post(req, res, mockNext())

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token',
      featureFlags: {},
      valuesToSave: {
        previousReleases: {
          hasBeenReleasedPreviously: true,
        },
        dateOfRelease: '2026-01-01',
      },
    })
  })
})
