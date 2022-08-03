import { Request, Response } from 'express'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendationPage } from './getRecommendationPage'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import { getRecommendation } from '../../data/makeDecisionApiClient'

jest.mock('../../data/makeDecisionApiClient')

const accessToken = 'abc'
const recommendationId = '123'
let req: Request
let res: Response

describe('getRecommendationPage', () => {
  beforeEach(() => {
    req = mockReq({ params: { recommendationId, pageId: 'recall-type' } })
    res = mockRes({ token: accessToken })
  })

  it('should return recommendation data', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    await getRecommendationPage(req, res)
    expect(res.locals.recommendation).toEqual(recommendationApiResponse)
    expect(res.locals.pageHeading).toEqual('What do you recommend?')
    expect(res.locals.pageTitle).toEqual('What do you recommend?')
    expect(res.locals.formValues.recallType).toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/recallType')
  })

  it('should throw on an API error', async () => {
    const thrownErr = new Error('test')
    ;(getRecommendation as jest.Mock).mockRejectedValue(thrownErr)
    try {
      await getRecommendationPage(req, res)
    } catch (err) {
      expect(err).toEqual(thrownErr)
    }
  })
})
