import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import apRationaleConfirmationController from './apRationaleConfirmationController'

jest.mock('../../monitoring/azureAppInsights')
jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load record decision - RECALL', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          id: '1234',
          crn: 'X123F',
          personOnProbation: {
            nomsNumber: '123X',
            name: 'Joe Bloggs',
          },
          spoRecallType: 'RECALL',
        },
        user: {
          username: 'MARD_RESIDENT_WORKER_USER',
          roles: ['ROLE_MAKE_RECALL_DECISION', 'ROLE_MARD_RESIDENT_WORKER'],
          hasSpoRole: false,
          hasPpcsRole: false,
          hasOdmRole: false,
        },
      },
    })
    const next = mockNext()
    await apRationaleConfirmationController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({
      id: 'apRationaleConfirmation',
      title: 'Recall started',
      bodyText1: 'Tell the probation practitioner you’ve started the recall. Give them the:',
      bodyText2: 'The practitioner will fill in the Part A.',
    })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/apRationaleConfirmation')

    expect(res.locals.nomsNumber).toEqual('123X')
    expect(res.locals.crn).toEqual('X123F')
    expect(res.locals.personOnProbation).toEqual('Joe Bloggs')
    expect(next).toHaveBeenCalled()
  })

  it('load record decision - NO RECALL', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          id: '1234',
          crn: 'X123F',
          personOnProbation: {
            nomsNumber: '123X',
            name: 'Joe Bloggs',
          },
          spoRecallType: 'NO_RECALL',
        },
        user: {
          username: 'MARD_RESIDENT_WORKER_USER',
          roles: ['ROLE_MAKE_RECALL_DECISION', 'ROLE_MARD_RESIDENT_WORKER'],
          hasSpoRole: false,
          hasPpcsRole: false,
          hasOdmRole: false,
        },
      },
    })
    const next = mockNext()
    await apRationaleConfirmationController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({
      id: 'apRationaleConfirmation',
      title: 'Decision not to recall',
      bodyText1: 'Tell the probation practitioner you made this decision. Give them the:',
      bodyText2: 'The practitioner will write the decision not to recall letter.',
    })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/apRationaleConfirmation')

    expect(res.locals.nomsNumber).toEqual('123X')
    expect(res.locals.crn).toEqual('X123F')
    expect(res.locals.personOnProbation).toEqual('Joe Bloggs')
    expect(next).toHaveBeenCalled()
  })
})
