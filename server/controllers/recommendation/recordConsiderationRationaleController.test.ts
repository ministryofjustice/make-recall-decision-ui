import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import recordConsiderationController from './recordConsiderationRationaleController'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'

jest.mock('../../monitoring/azureAppInsights')
jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('render page', async () => {
    const res = mockRes({
      locals: {
        recommendation: { personOnProbation: { name: 'Joe Bloggs' }, crn: 'X123' },
      },
    })
    const next = mockNext()
    await recordConsiderationController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'recordConsideration' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/recordConsiderationRationale')

    expect(res.locals.triggerLeadingToRecallCompleted).toBeFalsy()
    expect(res.locals.responseToProbationCompleted).toBeFalsy()
    expect(res.locals.licenceConditionsBreachedCompleted).toBeFalsy()
    expect(res.locals.alternativesToRecallTriedCompleted).toBeFalsy()
    expect(res.locals.isExtendedSentenceCompleted).toBeFalsy()
    expect(res.locals.isIndeterminateSentenceCompleted).toBeFalsy()
    expect(res.locals.allTasksCompleted).toBeFalsy()

    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('post with sensitive checked', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        sensitive: 'sensitive',
        crn: 'X098092',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        user: { username: 'Dave', region: { code: 'N07', name: 'London' } },
        urlInfo: { basePath: '/recommendation/123/' },
      },
    })
    const next = mockNext()

    await recordConsiderationController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        considerationSensitive: true,
        sendConsiderationRationaleToDelius: true,
      },
      featureFlags: {},
    })

    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdSendConsiderationRationaleToDelius',
      'Dave',
      {
        crn: 'X098092',
        recommendationId: '123',
        region: { code: 'N07', name: 'London' },
      },
      {}
    )
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendation/123/share-case-with-manager`)
    expect(next).not.toHaveBeenCalled()
  })

  it('post with sensitive unchecked', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        crn: 'X098092',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        user: { username: 'Dave', region: { code: 'N07', name: 'London' } },
        urlInfo: { basePath: '/recommendation/123/' },
      },
    })
    const next = mockNext()

    await recordConsiderationController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        considerationSensitive: false,
        sendConsiderationRationaleToDelius: true,
      },
      featureFlags: {},
    })

    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdSendConsiderationRationaleToDelius',
      'Dave',
      {
        crn: 'X098092',
        recommendationId: '123',
        region: { code: 'N07', name: 'London' },
      },
      {}
    )
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendation/123/share-case-with-manager`)
    expect(next).not.toHaveBeenCalled()
  })
})
