import { Response } from 'express'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { postRecommendationForm } from './postRecommendationForm'
import { updateRecommendation } from '../../data/makeDecisionApiClient'

jest.mock('../../data/makeDecisionApiClient')

describe('postRecommendationForm', () => {
  const recommendationId = '123'
  const pageId = 'recall-type'
  const crn = 'X12345'
  const currentPageUrl = `/recommendations/${recommendationId}/recall-type`
  const requestBody = {
    recallType: 'STANDARD',
    crn,
  }
  let res: Response

  beforeEach(() => {
    res = mockRes()
  })

  it('should update recommendation and redirect to next page', async () => {
    const recallDetails = { recommendationId }
    ;(updateRecommendation as jest.Mock).mockResolvedValueOnce(recallDetails)
    const req = mockReq({
      method: 'POST',
      params: { recommendationId, pageId },
      body: requestBody,
    })
    await postRecommendationForm(req, res)
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/${recommendationId}/custody-status`)
  })

  it('should reload the page and save errors if the user input is invalid', async () => {
    const recallDetails = { recommendationId }
    ;(updateRecommendation as jest.Mock).mockResolvedValueOnce(recallDetails)
    const req = mockReq({
      method: 'POST',
      params: { recommendationId, pageId },
      body: {
        crn,
      },
    })
    await postRecommendationForm(req, res)
    expect(res.redirect).toHaveBeenCalledWith(303, currentPageUrl)
    expect(req.session.errors).toEqual([
      {
        href: '#recallType',
        name: 'recallType',
        text: 'Select a recommendation',
        errorId: 'noRecallTypeSelected',
      },
    ])
  })

  it('should reload the page if the API errors', async () => {
    ;(updateRecommendation as jest.Mock).mockRejectedValueOnce(new Error('API error'))
    const req = mockReq({
      method: 'POST',
      params: { recommendationId, pageId },
      body: requestBody,
    })
    await postRecommendationForm(req, res)
    expect(req.session.errors).toEqual([
      {
        name: 'saveError',
        text: 'An error occurred saving your changes',
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, currentPageUrl)
  })

  it('should throw if a CRN is not in the request body', async () => {
    const recallDetails = { recommendationId }
    ;(updateRecommendation as jest.Mock).mockResolvedValueOnce(recallDetails)
    const req = mockReq({
      method: 'POST',
      params: { recommendationId, pageId },
      body: {},
    })
    try {
      await postRecommendationForm(req, res)
    } catch (err) {
      expect(err.status).toEqual(400)
      expect(err.name).toEqual('AppError')
    }
  })
})
