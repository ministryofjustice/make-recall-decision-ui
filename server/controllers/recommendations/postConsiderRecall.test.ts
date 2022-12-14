import { Response } from 'express'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { postConsiderRecall } from './postConsiderRecall'
import RestClient from '../../data/restClient'
import getRecommendationResponse from '../../../api/responses/get-recommendation.json'

describe('postConsiderRecall', () => {
  const crn = '123'
  let res: Response

  beforeEach(() => {
    res = mockRes({ locals: {} })
  })

  it('should create recommendation and redirect to next page if recommendation ID is not in request body', async () => {
    jest.spyOn(RestClient.prototype, 'post').mockResolvedValueOnce(getRecommendationResponse)
    const req = mockReq({
      method: 'POST',
      body: {
        crn,
        recallConsideredDetail: 'Details...',
      },
    })
    await postConsiderRecall(req, res)
    expect(RestClient.prototype.post).toHaveBeenCalledWith({
      data: { crn: '123', recallConsideredDetail: 'Details...' },
      headers: {
        'X-Feature-Flags': '{}',
      },
      path: '/recommendations',
    })
    expect(res.redirect).toHaveBeenCalledWith(303, `/cases/${crn}/overview`)
  })

  it('should update recommendation and redirect to next page if recommendation ID is in request body', async () => {
    jest.spyOn(RestClient.prototype, 'patch').mockResolvedValueOnce(getRecommendationResponse)
    const req = mockReq({
      method: 'POST',
      body: {
        crn,
        recallConsideredDetail: 'Details...',
        recommendationId: 'abc',
      },
    })
    await postConsiderRecall(req, res)
    expect(RestClient.prototype.patch).toHaveBeenCalledWith({
      data: { crn: '123', recallConsideredDetail: 'Details...' },
      headers: { 'X-Feature-Flags': '{}' },
      path: '/recommendations/abc',
    })
    expect(res.redirect).toHaveBeenCalledWith(303, `/cases/${crn}/overview`)
  })

  it('should reload the page and save errors if the user input is invalid', async () => {
    const req = mockReq({
      method: 'POST',
      body: {
        crn,
      },
    })
    await postConsiderRecall(req, res)
    expect(res.redirect).toHaveBeenCalledWith(303, '/cases/123/consider-recall')
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingRecallConsideredDetail',
        href: '#recallConsideredDetail',
        name: 'recallConsideredDetail',
        text: "Enter details about why you're considering a recall",
      },
    ])
  })

  it('should throw if a CRN is not in the request body', async () => {
    const req = mockReq({
      method: 'POST',
      body: {},
    })
    try {
      await postConsiderRecall(req, res)
    } catch (err) {
      expect(err.status).toEqual(400)
      expect(err.name).toEqual('AppError')
    }
  })
})
