import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import bookedToPpudController from './bookedToPpudController'

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
    await bookedToPpudController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'bookedToPpud' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/bookedToPpud')
    expect(res.locals.recommendation).toEqual(recommendation)
    expect(next).toHaveBeenCalled()
  })
})
