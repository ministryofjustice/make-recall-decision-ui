import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import redirectController from './redirectController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('redirect to response-to-probation', async () => {
    const res = mockRes({
      locals: {
        recommendation: { recallType: undefined },
        flags: { flagTriggerWork: false },
        urlInfo: { basePath: '/recommendation/123/' },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/response-to-probation')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to consider-recall-task-list', async () => {
    const res = mockRes({
      locals: {
        recommendation: { recallType: undefined },
        flags: { flagTriggerWork: true },
        urlInfo: { basePath: '/recommendation/123/' },
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/task-list-consider-recall')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to task-list', async () => {
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
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/task-list')
    expect(next).toHaveBeenCalled()
  })

  it('redirect to task-list-no-recall', async () => {
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
      },
    })
    const next = mockNext()
    await redirectController.get(mockReq(), res, next)

    expect(res.redirect).toHaveBeenCalledWith(301, '/recommendation/123/task-list-no-recall')
    expect(next).toHaveBeenCalled()
  })
})
