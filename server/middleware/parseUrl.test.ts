import { parseUrl } from './parseUrl'
import { mockReq, mockRes } from './testutils/mockRequestUtils'

describe('parseUrl', () => {
  it('saves request path to urlInfo object on res.locals', () => {
    const path = '/test'
    const req = mockReq({ originalUrl: '/test?q=1', path })
    const res = mockRes()
    const next = jest.fn()
    parseUrl(req, res, next)
    expect(res.locals.urlInfo.path).toEqual(path)
  })
})
