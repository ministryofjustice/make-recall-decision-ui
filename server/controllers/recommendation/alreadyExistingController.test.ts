import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import alreadyExisting from './alreadyExistingController'

describe('get', () => {
  it('present', async () => {
    const res = mockRes({
      locals: {
        recommendation: { crn: 'X1234B', createdDate: '2023-11-03T15:07:11.575Z' },
      },
    })
    const next = mockNext()
    await alreadyExisting.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'alreadyExisting' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/alreadyExisting')

    expect(next).toHaveBeenCalled()
  })
})
