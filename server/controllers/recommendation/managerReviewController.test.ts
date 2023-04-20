import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import managerReviewController from './managerReviewController'

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { id: '123', personOnProbation: { name: 'Harry Smith' } },
      },
    })
    const next = mockNext()
    await managerReviewController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'managerReview' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/managerReview')
    expect(next).toHaveBeenCalled()
  })
})
