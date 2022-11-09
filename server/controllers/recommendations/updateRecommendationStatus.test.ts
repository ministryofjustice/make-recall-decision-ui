import { Response } from 'express'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendationStatus } from './updateRecommendationStatus'
import { updateRecommendation } from '../../data/makeDecisionApiClient'

jest.mock('../../data/makeDecisionApiClient')

describe('updateRecommendationStatus', () => {
  const recommendationId = '123'
  const crn = 'X12345'
  const basePath = `/recommendations/${recommendationId}/`
  const requestBody = {
    status: 'DOCUMENT_CREATED',
    crn,
  }
  let res: Response

  beforeEach(() => {
    res = mockRes({ locals: { urlInfo: { basePath } } })
  })

  it('should update recommendation and redirect', async () => {
    const req = mockReq({
      method: 'POST',
      params: { recommendationId },
      body: requestBody,
    })
    await updateRecommendationStatus(req, res)
    expect(res.redirect).toHaveBeenCalledWith(303, `/cases/${crn}/recommendations`)
  })

  it('should throw if the API errors', async () => {
    ;(updateRecommendation as jest.Mock).mockRejectedValueOnce(new Error('API error'))
    const req = mockReq({
      method: 'POST',
      params: { recommendationId },
      body: requestBody,
    })
    try {
      await updateRecommendationStatus(req, res)
    } catch (err) {
      expect(err.name).toEqual('Error')
    }
  })

  it('should throw if a CRN is not in the request ', async () => {
    const req = mockReq({
      method: 'POST',
      params: { recommendationId },
      body: {
        status: 'DRAFT',
      },
    })
    try {
      await updateRecommendationStatus(req, res)
    } catch (err) {
      expect(err.status).toEqual(400)
      expect(err.data.errorType).toEqual('INVALID_CRN')
    }
  })

  it('should throw if the status is invalid', async () => {
    const req = mockReq({
      method: 'POST',
      params: { recommendationId },
      body: {
        crn: '123',
        status: 'RANDOM',
      },
    })
    try {
      await updateRecommendationStatus(req, res)
    } catch (err) {
      expect(err.status).toEqual(400)
      expect(err.data.errorType).toEqual('INVALID_RECOMMENDATION_STATUS')
    }
  })
})
