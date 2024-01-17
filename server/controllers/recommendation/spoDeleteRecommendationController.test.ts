import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import spoDeleteRecommendationController from './spoDeleteRecommendationController'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

import { getStatuses } from '../../data/makeDecisionApiClient'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('present without data when in RECALL_DECIDED state', async () => {
    ;(getStatuses as jest.Mock).mockReturnValueOnce([{ name: STATUSES.RECALL_DECIDED, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {
          id: '1',
          crn: 'X12345',
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await spoDeleteRecommendationController.get(mockReq(), res, next)
    expect(res.locals.page).toEqual({ id: 'deletePartARationale', bodyText: 'delete this Part A' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/spoDeleteRecommendationRationale')
  })
  it('present without data when in NO_RECALL_DECIDED state', async () => {
    ;(getStatuses as jest.Mock).mockReturnValueOnce([{ name: STATUSES.NO_RECALL_DECIDED, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {
          id: '1',
          crn: 'X12345',
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await spoDeleteRecommendationController.get(mockReq(), res, next)
    expect(res.locals.page).toEqual({ id: 'deleteDntrRationale', bodyText: 'delete this decision not to recall' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/spoDeleteRecommendationRationale')
  })
  it('present without data when in PO_START_RECALL state', async () => {
    ;(getStatuses as jest.Mock).mockReturnValueOnce([{ name: STATUSES.PO_START_RECALL, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {
          id: '1',
          crn: 'X12345',
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await spoDeleteRecommendationController.get(mockReq(), res, next)
    expect(res.locals.page).toEqual({ id: 'deleteRecommendationRationale', bodyText: 'delete this recommendation' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/spoDeleteRecommendationRationale')
  })
  it('present without data and is a legacy recommendation', async () => {
    ;(getStatuses as jest.Mock).mockReturnValueOnce([])
    const res = mockRes({
      locals: {
        recommendation: {
          id: '1',
          crn: 'X12345',
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await spoDeleteRecommendationController.get(mockReq(), res, next)
    expect(res.locals.page).toEqual({ id: 'deleteRecommendationRationale', bodyText: 'delete this recommendation' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/spoDeleteRecommendationRationale')
  })
})
