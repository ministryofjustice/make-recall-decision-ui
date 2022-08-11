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
    req = mockReq({ params: { recommendationId, pageId: 'custody-status' } })
    res = mockRes({ token: accessToken })
  })

  it('should fetch data and render a recommendation page', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    await getRecommendationPage(req, res)
    expect(res.locals.recommendation).toEqual(recommendationApiResponse)
    expect(res.locals.pageHeading).toEqual('Is Paula Smith in custody now?')
    expect(res.locals.pageTitle).toEqual('Is the person in custody now?')
    expect(res.locals.inputDisplayValues.value).toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/custodyStatus')
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
