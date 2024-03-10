import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, updateRecommendation, updateStatuses } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import apRecordDecisionController from './apRecordDecisionController'

jest.mock('../../monitoring/azureAppInsights')
jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load record decision - RECALL', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          id: '1234',
          spoRecallType: 'RECALL',
          spoRecallRationale: 'some reason',
        },
      },
    })
    const next = mockNext()
    await apRecordDecisionController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({
      id: 'apRecordDecision',
      bodyText:
        'This will be recorded as a contact in NDelius called ‘Management oversight- recall’. You cannot undo this.',
    })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/apRecordDecision')

    expect(res.locals.spoRecallRationale).toEqual('some reason')
    expect(next).toHaveBeenCalled()
  })

  it('load record decision - NO RECALL', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          id: '1234',
          spoRecallType: 'NO_RECALL',
          spoRecallRationale: 'some reason',
        },
      },
    })
    const next = mockNext()
    await apRecordDecisionController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({
      id: 'apRecordDecisionDNTR',
      bodyText:
        'The decision will be recorded as a contact in NDelius called ‘Management oversight - recall’ with the outcome ‘decision to not recall’. You cannot undo this.',
    })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/apRecordDecision')

    expect(res.locals.spoRecallRationale).toEqual('some reason')
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('post with valid data - RECALL', async () => {
    const recommendation = {
      id: '123',
      spoRecallType: 'RECALL',
    }
    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendation)
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(updateStatuses as jest.Mock).mockResolvedValue([])

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

    await apRecordDecisionController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        sensitive: true,
        sendSpoRationaleToDelius: true,
      },
      featureFlags: {},
    })

    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdSpoRationaleRecorded',
      'Dave',
      {
        crn: 'X098092',
        recommendationId: '123',
        region: { code: 'N07', name: 'London' },
      },
      {}
    )

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      activate: [STATUSES.SPO_RECORDED_RATIONALE],
      deActivate: [STATUSES.SPO_CONSIDER_RECALL],
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendation/123/ap-rationale-confirmation`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
  it('post with valid data - NO RECALL', async () => {
    const recommendation = {
      id: '123',
      spoRecallType: 'NO_RECALL',
    }
    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendation)
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(updateStatuses as jest.Mock).mockResolvedValue([])

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

    await apRecordDecisionController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        sensitive: true,
        sendSpoRationaleToDelius: true,
      },
      featureFlags: {},
    })

    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdSpoRationaleRecorded',
      'Dave',
      {
        crn: 'X098092',
        recommendationId: '123',
        region: { code: 'N07', name: 'London' },
      },
      {}
    )

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      activate: [STATUSES.NO_RECALL_DECIDED],
      deActivate: [STATUSES.SPO_CONSIDER_RECALL],
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendation/123/ap-rationale-confirmation`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
})
