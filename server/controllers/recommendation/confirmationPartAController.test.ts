import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import confirmationPartAController from './confirmationPartAController'

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: { id: '123', personOnProbation: { name: 'Harry Smith' } },
      },
    })
    const next = mockNext()
    await confirmationPartAController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'confirmationPartA' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/confirmationPartA')
    expect(next).toHaveBeenCalled()
  })
})
