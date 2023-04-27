import spoTaskListConsiderRecallController from './spoTaskListConsiderRecallController'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' }, crn: 'X123' },
        statuses: [],
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
    const res = mockRes({
      locals: {
        recommendation: {
          reviewPractitionersConcerns: true,
          reviewOffenderProfile: true,
          explainTheDecision: true,
        },
        statuses: [{ name: 'SPO_SIGNATURE_REQUESTED', active: true }],
      },
    })

    await spoTaskListConsiderRecallController.get(mockReq(), res, mockNext())

    expect(res.locals.reviewPractitionersConcernsCompleted).toBeTruthy()
    expect(res.locals.reviewOffenderProfileCompleted).toBeTruthy()
    expect(res.locals.explainTheDecisionCompleted).toBeTruthy()
    expect(res.locals.allTasksCompleted).toBeTruthy()
    expect(res.locals.isSpoSignatureRequested).toBeTruthy()
  })
})
