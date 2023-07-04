import spoTaskListConsiderRecallController from './spoTaskListConsiderRecallController'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { HMPPS_AUTH_ROLE } from '../../middleware/authorisationMiddleware'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../../monitoring/azureAppInsights')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' }, crn: 'X123' },
        user: {
          username: 'Dave',
          token: 'token1',
          roles: [HMPPS_AUTH_ROLE.PO],
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

    expect(res.locals.page).toEqual({ id: 'spoTaskListConsiderRecall' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/spoTaskListConsiderRecall')

    expect(res.locals.reviewPractitionersConcernsCompleted).toBeFalsy()
    expect(res.locals.reviewOffenderProfileCompleted).toBeFalsy()
    expect(res.locals.explainTheDecisionCompleted).toBeFalsy()
    expect(res.locals.allTasksCompleted).toBeFalsy()
    expect(res.locals.backLink).toEqual('/cases/X123/overview')

    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdSpoTasklistAccessed',
      'Dave',
      {
        crn: 'X123',
        recommendationId: '123',
      },
      {}
    )

    expect(next).toHaveBeenCalled()
  })

  it('load with query from rationale-check', async () => {
    const res = mockRes({
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' }, crn: 'X123' },
        user: {
          token: 'token1',
          roles: [HMPPS_AUTH_ROLE.PO],
        },
      },
    })
    await spoTaskListConsiderRecallController.get(
      mockReq({
        query: {
          fromPageId: 'rationale-check',
        },
        params: {
          recommendationId: '123',
        },
      }),
      res,
      mockNext()
    )

    expect(res.locals.backLink).toEqual('/recommendations/123/rationale-check')
  })

  it('load with existing data', async () => {
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
  })
})
