import { Response } from 'express'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { postRecommendationForm } from './postRecommendationForm'
import RestClient from '../../data/restClient'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'

jest.mock('../../monitoring/azureAppInsights')

describe('postRecommendationForm', () => {
  const recommendationId = '123'
  const pageUrlSlug = 'recall-type'
  const basePath = `/recommendations/${recommendationId}/`
  const currentPageUrl = `${basePath}recall-type`
  const requestBody = {
    crn: '123',
    recallType: 'STANDARD',
    recallTypeDetailsStandard: 'Details...',
  }
  const featureFlags = { flagExcludeFromAnalytics: false }
  let res: Response

  beforeEach(() => {
    res = mockRes({
      locals: {
        urlInfo: { basePath },
        user: { username: 'Dave', region: { code: 'N07', name: 'London' } },
        flags: featureFlags,
      },
    })
  })

  it('should update recommendation and redirect to next page', async () => {
    const recallDetails = { recommendationId }
    jest.spyOn(RestClient.prototype, 'patch').mockResolvedValueOnce(recallDetails)
    const req = mockReq({
      method: 'POST',
      params: { recommendationId, pageUrlSlug },
      body: requestBody,
    })
    await postRecommendationForm(req, res)
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/${recommendationId}/emergency-recall`)
  })

  it('should send feature flags to the API', async () => {
    const recallDetails = { recommendationId }
    res = mockRes({ locals: { urlInfo: { basePath }, flags: { flagExcludeFromAnalytics: true } } })
    jest.spyOn(RestClient.prototype, 'patch').mockResolvedValueOnce(recallDetails)
    const req = mockReq({
      method: 'POST',
      params: { recommendationId, pageUrlSlug },
      body: requestBody,
    })
    await postRecommendationForm(req, res)
    const lastCall = (RestClient.prototype.patch as jest.Mock).mock.calls[0]
    expect(lastCall[0].headers).toEqual({ 'X-Feature-Flags': '{"flagExcludeFromAnalytics":true}' })
  })

  it('should reload the page and save errors if the user input is invalid', async () => {
    const recallDetails = { recommendationId }
    jest.spyOn(RestClient.prototype, 'patch').mockResolvedValueOnce(recallDetails)
    const req = mockReq({
      method: 'POST',
      params: { recommendationId, pageUrlSlug },
      body: {
        recallType: 'STANDARD',
      },
    })
    await postRecommendationForm(req, res)
    expect(res.redirect).toHaveBeenCalledWith(303, currentPageUrl)
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingRecallTypeDetail',
        href: '#recallTypeDetailsStandard',
        name: 'recallTypeDetailsStandard',
        text: 'You must explain why you recommend this recall type',
      },
    ])
    expect(req.session.unsavedValues).toEqual({ recallType: 'STANDARD' })
  })

  it('should reload the page if the API errors', async () => {
    jest.spyOn(RestClient.prototype, 'patch').mockRejectedValueOnce(new Error('API error'))
    const req = mockReq({
      method: 'POST',
      params: { recommendationId, pageUrlSlug },
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
    jest.spyOn(RestClient.prototype, 'patch').mockResolvedValueOnce(recallDetails)
    const req = mockReq({
      method: 'POST',
      params: { recommendationId, pageUrlSlug },
      body: {},
    })
    try {
      await postRecommendationForm(req, res)
    } catch (err) {
      expect(err.status).toEqual(400)
      expect(err.name).toEqual('AppError')
    }
  })

  it('should send an appInsightsEvent for recall-type page', async () => {
    const recallDetails = { recommendationId }
    jest.spyOn(RestClient.prototype, 'patch').mockResolvedValueOnce(recallDetails)
    const req = mockReq({
      method: 'POST',
      params: { recommendationId, pageUrlSlug: 'recall-type' },
      body: { ...requestBody, crn: 'AB1234C' },
    })
    await postRecommendationForm(req, res)
    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdRecallType',
      'Dave',
      {
        crn: 'AB1234C',
        recallType: 'STANDARD',
        recommendationId,
        region: { code: 'N07', name: 'London' },
      },
      featureFlags
    )
  })

  it('should send an appInsightsEvent for recall-type-indeterminate page', async () => {
    const recallDetails = { recommendationId }
    jest.spyOn(RestClient.prototype, 'patch').mockResolvedValueOnce(recallDetails)
    const req = mockReq({
      method: 'POST',
      params: { recommendationId, pageUrlSlug: 'recall-type-indeterminate' },
      body: { ...requestBody, recallType: 'NO_RECALL', crn: 'AB1234C' },
    })
    await postRecommendationForm(req, res)
    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdRecallType',
      'Dave',
      {
        crn: 'AB1234C',
        recallType: 'NO_RECALL',
        recommendationId,
        region: { code: 'N07', name: 'London' },
      },
      featureFlags
    )
  })

  it('should add any confirmation message to the request session', async () => {
    const recallDetails = { recommendationId }
    jest.spyOn(RestClient.prototype, 'patch').mockResolvedValueOnce(recallDetails)
    const req = mockReq({
      method: 'POST',
      params: { recommendationId, pageUrlSlug: 'previous-releases' },
      body: {
        previousReleaseDates: '2020-01-01',
        deletePreviousReleaseDateIndex: '0',
      },
    })
    await postRecommendationForm(req, res)
    expect(req.session.confirmationMessage).toEqual({ text: 'The previous release has been deleted', type: 'success' })
  })
})
