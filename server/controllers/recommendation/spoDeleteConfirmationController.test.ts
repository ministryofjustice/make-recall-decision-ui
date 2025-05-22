import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import spoRationaleConfirmationController from './spoDeleteConfirmationController'

describe('get', () => {
  it('present', async () => {
    const recommendation = {
      crn: 'X1213',
      personOnProbation: { name: 'Joe Bloggs' },
      spoRecallType: 'XYZ',
    }

    const res = mockRes({
      locals: {
        recommendation,
      },
    })
    const next = mockNext()
    await spoRationaleConfirmationController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'spoDeleteConfirmation' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/spoDeleteConfirmation')
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(res.locals.recallType).toEqual('XYZ')
    expect(next).toHaveBeenCalled()
  })
})
