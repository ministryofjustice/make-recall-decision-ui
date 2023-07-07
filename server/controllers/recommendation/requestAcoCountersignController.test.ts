import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getStatuses, updateStatuses } from '../../data/makeDecisionApiClient'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import requestAcoCountersignController from './requestAcoCountersignController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no ACO_SIGNATURE_REQUESTED', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    const res = mockRes({
      locals: {
        recommendation: { id: '123', personOnProbation: { name: 'Harry Smith' } },
      },
    })
    const next = mockNext()
    await requestAcoCountersignController.get(
      mockReq({
        params: {
          recommendationId: '123',
        },
      }),
      res,
      next
    )

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token',
      activate: [STATUSES.ACO_SIGNATURE_REQUESTED],
      deActivate: [],
    })

    expect(res.locals.page).toEqual({ id: 'requestAcoCountersign' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/requestAcoCountersign')
    expect(res.locals.link).toEqual('http://localhost:3000/recommendations/123/task-list')
    expect(next).toHaveBeenCalled()
  })
  it('load with ACO_SIGNATURE_REQUESTED', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.ACO_SIGNATURE_REQUESTED, active: true }])
    const res = mockRes({
      locals: {
        recommendation: { id: '123', personOnProbation: { name: 'Harry Smith' } },
      },
    })
    const next = mockNext()
    await requestAcoCountersignController.get(
      mockReq({
        params: {
          recommendationId: '123',
        },
      }),
      res,
      next
    )

    expect(updateStatuses).not.toHaveBeenCalled()

    expect(res.locals.page).toEqual({ id: 'requestAcoCountersign' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/requestAcoCountersign')
    expect(res.locals.link).toEqual('http://localhost:3000/recommendations/123/task-list')

    expect(next).toHaveBeenCalled()
  })
})
