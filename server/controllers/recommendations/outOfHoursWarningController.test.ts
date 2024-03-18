import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import outOfHoursWarningController from './outOfHoursWarningController'
import { getCaseSection } from '../caseSummary/getCaseSection'
import { createRecommendation, getStatuses, updateStatuses } from '../../data/makeDecisionApiClient'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'

jest.mock('../../monitoring/azureAppInsights')
jest.mock('../caseSummary/getCaseSection')
jest.mock('../../data/makeDecisionApiClient')

describe('Out of Hours Warning Controller', () => {
  describe('get', () => {
    it('present - invalid role', async () => {
      const req = mockReq({
        params: { crn: 'A1234AB' },
      })
      const res = mockRes({
        locals: {
          recommendation: { spoRecallType: undefined, spoRecallRationale: undefined },
          statuses: [],
          user: {
            username: 'Dave',
            roles: ['ROLE_MAKE_RECALL_DECISION'],
            id: '12345',
          },
          query: {},
          flags: { xyz: true },
        },
      })
      const next = mockNext()
      await outOfHoursWarningController.get(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith('/inappropriate-error')
      expect(next).not.toHaveBeenCalled()
    })
    it('present - no inflight recommendation', async () => {
      const req = mockReq({
        params: { crn: 'A1234AB' },
      })
      const res = mockRes({
        locals: {
          recommendation: { spoRecallType: undefined, spoRecallRationale: undefined },
          statuses: [],
          user: {
            username: 'Dave',
            roles: ['ROLE_MAKE_RECALL_DECISION', 'ROLE_MARD_RESIDENT_WORKER'],
            id: '12345',
          },
          query: {},
          flags: { xyz: true },
        },
      })
      const next = mockNext()
      ;(getCaseSection as jest.Mock).mockReturnValueOnce({
        caseSummary: { activeRecommendation: { recommendationId: '123' } },
      })
      ;(getStatuses as jest.Mock).mockResolvedValue([])
      await outOfHoursWarningController.get(req, res, next)

      expect(res.locals.page).toEqual({ id: 'outOfHoursWarning' })
      expect(res.render).toHaveBeenCalledWith('pages/outOfHoursWarning')
      expect(next).toHaveBeenCalled()
    })
    it('present - has in-flight recommendation with SPO_CONSIDER_RECALL', async () => {
      const req = mockReq({
        params: { crn: 'A1234AB' },
      })
      const res = mockRes({
        locals: {
          recommendation: { spoRecallType: undefined, spoRecallRationale: undefined },
          statuses: ['SPO_CONSIDER_RECALL'],
          user: {
            username: 'Dave',
            roles: ['ROLE_MAKE_RECALL_DECISION', 'ROLE_MARD_RESIDENT_WORKER'],
            id: '12345',
          },
          query: {},
          flags: { xyz: true },
        },
      })
      const next = mockNext()
      ;(getCaseSection as jest.Mock).mockReturnValueOnce({
        caseSummary: { activeRecommendation: { recommendationId: '123' } },
      })
      ;(getStatuses as jest.Mock).mockResolvedValue([])
      await outOfHoursWarningController.get(req, res, next)

      expect(res.locals.page).toEqual({ id: 'outOfHoursWarning' })
      expect(res.render).toHaveBeenCalledWith('pages/outOfHoursWarning')
      expect(next).toHaveBeenCalled()
    })
    it('present - has in-flight recommendation with SPO_CONSIDER_RECALL SPO_RATIONALE_RECORDED', async () => {
      const req = mockReq({
        params: { crn: 'A1234AB' },
      })
      const res = mockRes({
        locals: {
          recommendation: { spoRecallType: undefined, spoRecallRationale: undefined },
          statuses: ['SPO_RATIONALE_RECORDED'],
          user: {
            username: 'Dave',
            roles: ['ROLE_MAKE_RECALL_DECISION', 'ROLE_MARD_RESIDENT_WORKER'],
            id: '12345',
          },
          query: {},
          flags: { xyz: true },
        },
      })
      const next = mockNext()
      ;(getCaseSection as jest.Mock).mockReturnValueOnce({
        caseSummary: { activeRecommendation: { recommendationId: '123' } },
      })
      ;(getStatuses as jest.Mock).mockResolvedValue([])
      await outOfHoursWarningController.get(req, res, next)

      expect(res.locals.page).toEqual({ id: 'outOfHoursWarning' })
      expect(res.render).toHaveBeenCalledWith('pages/outOfHoursWarning')
      expect(next).toHaveBeenCalled()
    })
  })

  it('present - existing recommendation', async () => {
    ;(getCaseSection as jest.Mock).mockReturnValueOnce({
      caseSummary: { activeRecommendation: { recommendationId: '123' } },
    })
    ;(getStatuses as jest.Mock).mockResolvedValue([])

    const res = mockRes()
    const next = mockNext()
    await outOfHoursWarningController.post(
      mockReq({
        body: {
          crn: 'X1234Y',
        },
      }),
      res,
      next
    )

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/ap-licence-conditions`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('present - no recommendation', async () => {
    ;(getCaseSection as jest.Mock).mockReturnValueOnce({
      caseSummary: { activeRecommendation: undefined },
    })
    ;(createRecommendation as jest.Mock).mockReturnValueOnce({
      id: '456',
    })

    const res = mockRes()
    const next = mockNext()
    await outOfHoursWarningController.post(
      mockReq({
        body: {
          crn: 'X1234Y',
        },
      }),
      res,
      next
    )

    expect(createRecommendation).toHaveBeenCalledWith({ crn: 'X1234Y' }, 'token', {})

    expect(updateStatuses).toHaveBeenCalledWith({
      activate: ['PO_START_RECALL'],
      deActivate: [],
      recommendationId: '456',
      token: 'token',
    })

    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdRecommendationStarted',
      undefined,
      {
        crn: 'X1234Y',
        recommendationId: '456',
        region: undefined,
      },
      {}
    )

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/456/ap-licence-conditions`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
})
