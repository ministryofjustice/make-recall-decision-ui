import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import previousRecallController from './previousRecallsController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with existing data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue('recommendation doc')
    const res = mockRes()
    const next = mockNext()
    await previousRecallController.get(mockReq({ params: { recommendationId: '123' } }), res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      featureFlags: {},
      propertyToRefresh: 'previousRecalls',
      recommendationId: '123',
      token: 'token',
    })

    expect(res.locals.recommendation).toEqual('recommendation doc')
    expect(res.locals.page.id).toEqual('previousRecalls')
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

    await previousRecallController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        previousRecalls: {
          hasBeenRecalledPreviously: true,
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
        previousRecallDates: '2005-01-01|',
        deletePreviousRecallDateIndex: '0',
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

    await previousRecallController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        previousRecalls: {
          previousRecallDates: [],
        },
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/previous-recalls`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
})
