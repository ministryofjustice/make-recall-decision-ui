import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import noPpcsSearchResultsController from "./noPpcsSearchResultsController";

describe('get', () => {
  it('load', async () => {
    const res = mockRes()
    const next = mockNext()
    await noPpcsSearchResultsController.get(mockReq({ query: { crn: '123' } }), res, next)

    expect(res.locals.page).toEqual({ id: 'noPpcsSearchResults' })
    expect(res.locals.crn).toEqual('123')
    expect(res.render).toHaveBeenCalledWith('pages/noPpcsSearchResults')
    expect(next).toHaveBeenCalled()
  })
})
