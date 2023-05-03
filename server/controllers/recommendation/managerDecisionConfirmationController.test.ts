import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import managerDecisionConfirmationController from './managerDecisionConfirmationController'

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { id: '123', personOnProbation: { name: 'Harry Smith' } },
      },
    })
    const next = mockNext()
    await managerDecisionConfirmationController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'managerDecisionConfirmation' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/managerDecisionConfirmation')
    expect(next).toHaveBeenCalled()
  })
})
