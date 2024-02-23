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
    it('present', async () => {
      const res = mockRes()
      const next = mockNext()

      await outOfHoursWarningController.get(mockReq(), res, next)

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

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/licence-conditions-ap`)
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

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/456/licence-conditions-ap`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
})
