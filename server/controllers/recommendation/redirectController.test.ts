import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import redirectController from './redirectController'
import { getStatuses, updateStatuses } from '../../data/makeDecisionApiClient'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('redirect to response-to-probation', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    const res = mockRes({
      locals: {
        recommendation: { recallType: undefined },
        flags: { flagTriggerWork: false },
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION'],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/response-to-probation')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to consider-recall-task-list', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    const res = mockRes({
      locals: {
        recommendation: { recallType: undefined },
        flags: { flagTriggerWork: true },
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION'],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/task-list-consider-recall')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to task-list', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    const res = mockRes({
      locals: {
        recommendation: {
          recallType: {
            selected: {
              value: 'STANDARD',
            },
          },
        },
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION'],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/task-list')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to task-list-no-recall', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    const res = mockRes({
      locals: {
        recommendation: {
          recallType: {
            selected: {
              value: 'NO_RECALL',
            },
          },
        },
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION'],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/task-list-no-recall')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to spo-task-list-consider-recall', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([])
    const res = mockRes({
      locals: {
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION', 'ROLE_MAKE_RECALL_DECISION_SPO'],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(updateStatuses).not.toHaveBeenCalled()

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/spo-task-list-consider-recall')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to spo-task-list-consider-recall and update spo status', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: 'SPO_CONSIDER_RECALL', active: true }])
    const res = mockRes({
      locals: {
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          roles: ['ROLE_MAKE_RECALL_DECISION', 'ROLE_MAKE_RECALL_DECISION_SPO'],
        },
      },
    })
    const next = mockNext()

    await redirectController.get(
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
      activate: ['SPO_CONSIDERING_RECALL'],
      deActivate: ['SPO_CONSIDER_RECALL'],
    })

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/spo-task-list-consider-recall')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to task-list-no-recall', async () => {
    ;(getStatuses as jest.Mock).mockResolvedValue([{ name: 'SPO_CONSIDER_RECALL', active: true }])
    const res = mockRes({
      locals: {
        recommendation: {
          recallType: {
            selected: {
              value: 'NO_RECALL',
            },
          },
        },
        urlInfo: { basePath: '/recommendation/123/' },
        user: {
          token: 'token1',
          roles: ['ROLE_MAKE_RECALL_DECISION'],
        },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(updateStatuses).not.toHaveBeenCalled()

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/task-list-no-recall')
    expect(next).toHaveBeenCalled()
  })
})
