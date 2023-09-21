import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import previousReleasesController from './previousReleasesController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with existing data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue('recommendation doc')
    const res = mockRes()
    const next = mockNext()
    await previousReleasesController.get(mockReq({ params: { recommendationId: '123' } }), res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: {},
      propertyToRefresh: 'previousReleases',
      recommendationId: '123',
      token: 'token',
    })

    expect(res.locals.recommendation).toEqual('recommendation doc')
    expect(res.locals.page.id).toEqual('previousReleases')
  })
})

describe('post', () => {
  it('post continue', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        continueButton: '1',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })
    const next = mockNext()

    await previousReleasesController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        previousReleases: {
          hasBeenReleasedPreviously: true,
        },
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/task-list#heading-person-details`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post delete', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        previousReleaseDates: '2005-01-01|',
        deletePreviousReleaseDateIndex: '0',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })
    const next = mockNext()

    await previousReleasesController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        previousReleases: {
          previousReleaseDates: [],
        },
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/previous-releases`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
})
