import { mockNext, mockReq, mockRes } from '../../../../middleware/testutils/mockRequestUtils'
import Controller from '../../controller'

describe('TestModule Test', () => {
  it('Loads the page', async () => {
    const res = mockRes()
    const req = mockReq()
    const next = mockNext()

    await Controller.get(req, res, next)

    expect(res.locals.testVariable).toBe('Hello!')
  })
})
