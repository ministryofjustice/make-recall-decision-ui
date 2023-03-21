import { mockReq, mockRes } from '../middleware/testutils/mockRequestUtils'
import retrieveRecommendation from './retrieveRecommendation'
import { getRecommendation } from '../data/makeDecisionApiClient'
import recommendationApiResponse from '../../api/responses/get-recommendation.json'

jest.mock('../data/makeDecisionApiClient')

describe('retrieve recommendation', () => {
  it('retrieve', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const res = mockRes({
      locals: {
        user: { token: 'abc' },
      },
    })

    const next = jest.fn()
    await retrieveRecommendation(
      mockReq({
        params: {
          recommendationId: '123',
        },
      }),
      res,
      next
    )

    expect(res.locals.recommendation).toEqual(recommendationApiResponse)

    expect(next).toHaveBeenCalled()
  })

  it('retrieve invalid case', async () => {
    const lockedCase = {
      ...recommendationApiResponse,
      userAccessResponse: {
        userNotFound: true,
      },
    }
    ;(getRecommendation as jest.Mock).mockResolvedValue(lockedCase)

    const res = mockRes({
      locals: {
        user: { token: 'abc' },
      },
    })

    const next = jest.fn()
    await retrieveRecommendation(
      mockReq({
        params: {
          recommendationId: '123',
        },
      }),
      res,
      next
    )

    expect(res.locals.caseSummary).toEqual(lockedCase)
    expect(res.render).toHaveBeenCalledWith('pages/excludedRestrictedCrn')
  })

  it('retrieve completed case', async () => {
    const completedCase = {
      ...recommendationApiResponse,
      status: 'DOCUMENT_DOWNLOADED',
    }
    ;(getRecommendation as jest.Mock).mockResolvedValue(completedCase)

    const res = mockRes({
      locals: {
        user: { token: 'abc' },
      },
    })

    const next = jest.fn()
    await retrieveRecommendation(
      mockReq({
        params: {
          recommendationId: '123',
        },
      }),
      res,
      next
    )

    expect(res.redirect).toHaveBeenCalledWith(301, '/cases/X12345/overview')
  })
})
