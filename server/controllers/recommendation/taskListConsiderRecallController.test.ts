import taskListConsiderRecallController from './taskListConsiderRecallController'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' }, crn: 'X123' },
        flags: { flagTriggerWork: false },
      },
    })
    const next = mockNext()
    await taskListConsiderRecallController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'taskListConsiderRecall' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/taskListConsiderRecall')

    expect(res.locals.triggerLeadingToRecallCompleted).toBeFalsy()
    expect(res.locals.responseToProbationCompleted).toBeFalsy()
    expect(res.locals.licenceConditionsBreachedCompleted).toBeFalsy()
    expect(res.locals.alternativesToRecallTriedCompleted).toBeFalsy()
    expect(res.locals.isExtendedSentenceCompleted).toBeFalsy()
    expect(res.locals.isIndeterminateSentenceCompleted).toBeFalsy()
    expect(res.locals.allTasksCompleted).toBeFalsy()

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          triggerLeadingToRecall: 'text',
          responseToProbation: 'text',
          licenceConditionsBreached: {},
          alternativesToRecallTried: {},
          isExtendedSentence: {},
          isIndeterminateSentence: {},
        },
      },
    })

    await taskListConsiderRecallController.get(mockReq(), res, mockNext())

    expect(res.locals.triggerLeadingToRecallCompleted).toBeTruthy()
    expect(res.locals.responseToProbationCompleted).toBeTruthy()
    expect(res.locals.licenceConditionsBreachedCompleted).toBeTruthy()
    expect(res.locals.alternativesToRecallTriedCompleted).toBeTruthy()
    expect(res.locals.isExtendedSentenceCompleted).toBeTruthy()
    expect(res.locals.isIndeterminateSentenceCompleted).toBeTruthy()
    expect(res.locals.allTasksCompleted).toBeTruthy()
  })
})
