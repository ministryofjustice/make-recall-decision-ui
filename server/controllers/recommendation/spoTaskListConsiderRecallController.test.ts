import spoTaskListConsiderRecallController from './spoTaskListConsiderRecallController'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getStatuses, updateStatuses } from '../../data/makeDecisionApiClient'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { HMPPS_AUTH_ROLE } from '../../middleware/authorisationMiddleware'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.SPO_CONSIDERING_RECALL, active: true }])
    const res = mockRes({
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' }, crn: 'X123' },
        user: {
          token: 'token1',
          roles: [HMPPS_AUTH_ROLE.PO],
        },
      },
    })
    const next = mockNext()
    await spoTaskListConsiderRecallController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'spoTaskListConsiderRecall' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/spoTaskListConsiderRecall')

    expect(res.locals.reviewPractitionersConcernsCompleted).toBeFalsy()
    expect(res.locals.reviewOffenderProfileCompleted).toBeFalsy()
    expect(res.locals.explainTheDecisionCompleted).toBeFalsy()
    expect(res.locals.allTasksCompleted).toBeFalsy()

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.SPO_CONSIDERING_RECALL, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {
          reviewPractitionersConcerns: true,
          reviewOffenderProfile: true,
          explainTheDecision: true,
        },
        user: {
          token: 'token1',
          roles: [HMPPS_AUTH_ROLE.PO],
        },
      },
    })

    await spoTaskListConsiderRecallController.get(mockReq(), res, mockNext())

    expect(res.locals.reviewPractitionersConcernsCompleted).toBeTruthy()
    expect(res.locals.reviewOffenderProfileCompleted).toBeTruthy()
    expect(res.locals.explainTheDecisionCompleted).toBeTruthy()
    expect(res.locals.allTasksCompleted).toBeTruthy()
  })

  it('redirect to spo-task-list-consider-recall and update spo status', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: STATUSES.SPO_CONSIDER_RECALL, active: true }])
    const res = mockRes({
      locals: {
        recommendation: {
          reviewPractitionersConcerns: true,
          reviewOffenderProfile: true,
          explainTheDecision: true,
        },
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          roles: [HMPPS_AUTH_ROLE.PO, HMPPS_AUTH_ROLE.SPO],
        },
      },
    })
    const next = mockNext()

    await spoTaskListConsiderRecallController.get(
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
      activate: [STATUSES.SPO_CONSIDERING_RECALL],
      deActivate: [STATUSES.SPO_CONSIDER_RECALL],
    })
  })
})
