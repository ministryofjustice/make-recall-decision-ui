import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import confirmationNoRecallController from './confirmationNoRecallController'

describe('get', () => {
  it('present', async () => {
    const recommendation = {
      crn: 'X1213',
    }

    const res = mockRes({
      locals: {
        recommendation,
      },
    })
    const next = mockNext()
    await confirmationNoRecallController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'confirmationNoRecallLetter' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/confirmationNoRecallLetter')
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(next).toHaveBeenCalled()
  })
})
