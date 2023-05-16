import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import countersignConfirmationController from './countersignConfirmationController'
import { getStatuses, updateStatuses } from '../../data/makeDecisionApiClient'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('present for SPO_SIGNED with no ACO_SIGNATURE_REQUESTED set', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.SPO_SIGNED, active: true }])
    const recommendation = {
      crn: 'X1213',
      personOnProbation: { name: 'Harry Smith' },
    }

    const res = mockRes({
      locals: {
        recommendation,
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION'],
        },
      },
    })
    const next = mockNext()
    await countersignConfirmationController.get(
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

    expect(res.locals.page).toEqual({ id: 'countersignConfirmation' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/countersignConfirmation')
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(next).toHaveBeenCalled()
  })
  it('present for SPO_SIGNED with ACO_SIGNATURE_REQUESTED set', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([
      { name: STATUSES.SPO_SIGNED, active: true },
      { name: STATUSES.ACO_SIGNED, active: true },
      { name: STATUSES.ACO_SIGNATURE_REQUESTED, active: true },
    ])
    const recommendation = {
      crn: 'X1213',
      personOnProbation: { name: 'Harry Smith' },
    }

    const res = mockRes({
      locals: {
        recommendation,
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION'],
        },
      },
    })
    const next = mockNext()
    await countersignConfirmationController.get(
      mockReq({
        params: {
          recommendationId: '123',
        },
      }),
      res,
      next
    )

    expect(updateStatuses).not.toHaveBeenCalled()

    expect(res.locals.isAcoSigned).toEqual(true)
    expect(res.locals.page).toEqual({ id: 'countersignConfirmation' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/countersignConfirmation')
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(next).toHaveBeenCalled()
  })
})
