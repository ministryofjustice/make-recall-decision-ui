import { Response } from 'express'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendationStatus } from './updateRecommendationStatus'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { AuditService } from '../../services/auditService'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../../monitoring/azureAppInsights')

describe('updateRecommendationStatus', () => {
  const recommendationId = '123'
  const crn = 'X12345'
  const basePath = `/recommendations/${recommendationId}/`
  const requestBody = {
    status: 'DELETED',
    crn,
  }
  let res: Response
  const featureFlags = { flagExcludeFromAnalytics: true }

  beforeEach(() => {
    res = mockRes({
      locals: {
        urlInfo: { basePath },
        user: { username: 'Bill', region: { code: 'N07', name: 'London' } },
        flags: featureFlags,
      },
    })
  })

  it('should update recommendation and redirect to recommendations tab if set to DELETED', async () => {
    const req = mockReq({
      method: 'POST',
      params: { recommendationId },
      body: {
        status: 'DELETED',
        crn,
      },
    })
    await updateRecommendationStatus(req, res)
    expect(res.redirect).toHaveBeenCalledWith(303, `/cases/${crn}/recommendations`)
  })

  it('should update recommendation, redirect and fire event if set to DRAFT', async () => {
    const req = mockReq({
      method: 'POST',
      params: { recommendationId },
      body: {
        status: 'DRAFT',
        crn,
      },
    })
    await updateRecommendationStatus(req, res)
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/${recommendationId}/response-to-probation`)
    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdRecommendationStarted',
      'Bill',
      {
        crn,
        recommendationId,
        region: { code: 'N07', name: 'London' },
      },
      featureFlags
    )
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

  it('should send audit event if recommendation status set to DELETED', async () => {
    const req = mockReq({
      method: 'POST',
      params: { recommendationId },
      body: {
        status: 'DELETED',
        crn,
      },
    })
    jest.spyOn(AuditService.prototype, 'recommendationDeleted')
    await updateRecommendationStatus(req, res)
    expect(AuditService.prototype.recommendationDeleted).toHaveBeenCalledWith({
      crn,
      recommendationId,
      username: 'Bill',
      logErrors: false,
    })
  })
})
