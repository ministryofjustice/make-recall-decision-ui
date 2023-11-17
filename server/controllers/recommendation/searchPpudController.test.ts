import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import ppcsConsiderRecallController from './searchPpudController'

describe('get', () => {
  it('load', async () => {
    const res = mockRes({
      locals: {
        recommendation: { crn: 'X123' },
      },
    })
    const next = mockNext()
    await ppcsConsiderRecallController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'searchPpud' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/searchPpud')

    expect(next).toHaveBeenCalled()
  })
})
