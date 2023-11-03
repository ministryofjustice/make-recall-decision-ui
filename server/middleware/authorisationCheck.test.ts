import { mockNext, mockReq, mockRes } from './testutils/mockRequestUtils'
import { hasRole } from './check'
import { authorisationCheck } from './authorisationCheck'

jest.mock('../data/makeDecisionApiClient')

describe('authorisationCheck', () => {
  it('should allow as role is present', async () => {
    const res = mockRes({
      locals: {
        user: {
          roles: ['XYZ'],
        },
      },
    })
    const next = mockNext()

    await authorisationCheck(hasRole('XYZ'))(
      mockReq({
        params: { recommendationId: '123' },
      }),
      res,
      next
    )

    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('should disallow as role is not present', async () => {
    const res = mockRes({
      locals: {
        user: {
          roles: [],
        },
      },
    })
    const next = mockNext()

    await authorisationCheck(hasRole('XYZ'))(
      mockReq({
        params: { recommendationId: '123' },
      }),
      res,
      next
    )

    expect(res.redirect).toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
  })
})
