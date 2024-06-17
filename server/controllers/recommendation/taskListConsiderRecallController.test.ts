import taskListConsiderRecallController from './taskListConsiderRecallController'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getStatuses, updateStatuses } from '../../data/makeDecisionApiClient'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' }, crn: 'X123' },
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

  it('load with existing data cvl licences', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          triggerLeadingToRecall: 'text',
          responseToProbation: 'text',
          cvlLicenceConditionsBreached: {},
          alternativesToRecallTried: {},
          isExtendedSentence: {},
          isIndeterminateSentence: {},
        },
      },
    })

    await taskListConsiderRecallController.get(mockReq(), res, mockNext())

    expect(res.locals.licenceConditionsBreachedCompleted).toBeTruthy()
    expect(res.locals.allTasksCompleted).toBeTruthy()
  })
})

describe('post', () => {
  it('post with statuses', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([
      {
        name: STATUSES.SPO_CONSIDER_RECALL,
        active: true,
        recommendationId: 123,
        createdBy: 'MAKE_RECALL_DECISION_SPO_USER',
        created: '2023-04-13T10:52:11.624Z',
        modifiedBy: null,
        modified: null,
        createdByUserFullName: 'Making Recall Decisions SPO User',
        modifiedByUserFullName: null,
      },
      {
        name: STATUSES.PO_RECALL_CONSULT_SPO,
        active: true,
        recommendationId: 123,
        createdBy: 'MAKE_RECALL_DECISION_SPO_USER',
        created: '2023-04-13T10:52:11.624Z',
        modifiedBy: null,
        modified: null,
        createdByUserFullName: 'Making Recall Decisions SPO User',
        modifiedByUserFullName: null,
      },
    ])

    const req = mockReq({
      params: { recommendationId: '123' },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        urlInfo: { basePath: '/recommendation/123/' },
      },
    })
    const next = mockNext()

    await taskListConsiderRecallController.post(req, res, next)

    expect(getStatuses).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
    })

    expect(updateStatuses).not.toHaveBeenCalled()

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendation/123/share-case-with-manager`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with no statuses', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    ;(updateStatuses as jest.Mock).mockResolvedValue([])

    const req = mockReq({
      params: { recommendationId: '123' },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        urlInfo: { basePath: '/recommendation/123/' },
      },
    })
    const next = mockNext()

    await taskListConsiderRecallController.post(req, res, next)

    expect(getStatuses).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
    })

    expect(updateStatuses).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      activate: [STATUSES.SPO_CONSIDER_RECALL, STATUSES.PO_RECALL_CONSULT_SPO],
      deActivate: [],
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendation/123/share-case-with-manager`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
})
