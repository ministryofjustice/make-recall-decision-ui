import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import taskListNoRecallController from './taskListNoRecallController'

describe('get', () => {
  it('present', async () => {
    const recommendation = {
      crn: 'X1213',
      recallType: { selected: { value: 'NO_RECALL' } },
    }

    const res = mockRes({
      locals: {
        recommendation,
      },
    })
    const next = mockNext()
    await taskListNoRecallController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'taskListNoRecall' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/taskListNoRecall')
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(next).toHaveBeenCalled()
  })

  it('present - task-list-no-recall if recall type set to NO_RECALL', async () => {
    const recommendation = {
      crn: 'X1213',
      recallType: { selected: { value: 'FIXED_TERM' } },
    }

    const res = mockRes({
      locals: {
        recommendation,
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })
    const next = mockNext()
    await taskListNoRecallController.get(mockReq(), res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, '/recommendations/123/task-list')
  })

  it('present - response to probation if no recall type set', async () => {
    const recommendation = {
      crn: 'X1213',
    }

    const res = mockRes({
      locals: {
        recommendation,
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })
    const next = mockNext()
    await taskListNoRecallController.get(mockReq(), res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, '/recommendations/123/response-to-probation')
  })
})
