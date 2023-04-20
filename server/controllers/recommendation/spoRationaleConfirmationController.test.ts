import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import spoRationaleConfirmationController from './spoRationaleConfirmationController'

describe('get', () => {
  it('present', async () => {
    const recommendation = {
      crn: 'X1213',
      personOnProbation: { name: 'Harry Smith' },
      spoRecallType: 'XYZ',
    }

    const res = mockRes({
      locals: {
        recommendation,
      },
    })
    const next = mockNext()
    await spoRationaleConfirmationController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'spoRationaleConfirmation' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/spoRationaleConfirmation')
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(res.locals.recallType).toEqual('XYZ')
    expect(next).toHaveBeenCalled()
  })
})
