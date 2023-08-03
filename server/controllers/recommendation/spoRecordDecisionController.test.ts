import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getStatuses, updateRecommendation, updateStatuses } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import spoRecordDecisionController from './spoRecordDecisionController'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'

jest.mock('../../monitoring/azureAppInsights')
jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load record decision with RECALL type and editable', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.SPO_CONSIDER_RECALL, active: true }])
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
    await spoRecordDecisionController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'spoRecordDecision' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/spoRecordDecision')

    expect(res.locals.recallType).toEqual('RECALL')
    expect(res.locals.spoRecallRationale).toEqual('some reason')
    expect(res.locals.editable).toEqual(true)
    expect(next).toHaveBeenCalled()
  })

  it('load record decision with RECALL type and not editable', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    const res = mockRes({
      locals: {
        recommendation: {
          id: '1234',
          spoRecallType: 'RECALL',
        },
      },
    })
    await spoRecordDecisionController.get(mockReq(), res, mockNext())

    expect(res.locals.recallType).toEqual('RECALL')
    expect(res.locals.editable).toEqual(false)
  })
  it('load record decision with NO_RECALL type and editable', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.SPO_CONSIDER_RECALL, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {
          id: '1234',
          spoRecallType: 'NO_RECALL',
        },
      },
    })
    await spoRecordDecisionController.get(mockReq(), res, mockNext())

    expect(res.locals.recallType).toEqual('NO_RECALL')
    expect(res.locals.editable).toEqual(true)
  })
  it('load record decision with NO_RECALL type and not editable', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.SPO_CONSIDER_RECALL, active: false }])
    const res = mockRes({
      locals: {
        recommendation: {
          id: '1234',
          spoRecallType: 'NO_RECALL',
        },
      },
    })
    await spoRecordDecisionController.get(mockReq(), res, mockNext())

    expect(res.locals.recallType).toEqual('NO_RECALL')
    expect(res.locals.editable).toEqual(false)
  })
})

describe('post', () => {
  it('post with valid data', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
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

    await spoRecordDecisionController.post(req, res, next)

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

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendation/123/spo-rationale-confirmation`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with checkbox unchecked', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(updateStatuses as jest.Mock).mockResolvedValue([])

    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        sensitive: undefined,
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        urlInfo: { basePath: '/recommendation/123/' },
      },
    })
    await spoRecordDecisionController.post(req, res, mockNext())

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        sensitive: false,
        sendSpoRationaleToDelius: true,
      },
      featureFlags: {},
    })
  })
  it('close document', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.PP_DOCUMENT_CREATED, active: true }])
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(updateStatuses as jest.Mock).mockResolvedValue([])

    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        sensitive: 'sensitive',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        urlInfo: { basePath: '/recommendation/123/' },
      },
    })
    const next = mockNext()

    await spoRecordDecisionController.post(req, res, next)

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      activate: [STATUSES.SPO_RECORDED_RATIONALE, STATUSES.CLOSED],
      deActivate: [STATUSES.SPO_CONSIDER_RECALL],
    })
  })
})
