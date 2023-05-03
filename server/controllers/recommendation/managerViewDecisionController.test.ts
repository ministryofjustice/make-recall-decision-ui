import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import managerViewDecisionController from './managerViewDecisionController'

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { id: '123', personOnProbation: { name: 'Harry Smith' } },
      },
    })
    const next = mockNext()
    await managerViewDecisionController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'managerViewDecision' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/managerViewDecision')
    expect(next).toHaveBeenCalled()
  })
})
