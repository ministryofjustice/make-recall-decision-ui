import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { startPage } from './startPage'

describe('startPage', () => {
  it('normal operation', async () => {
    const res = mockRes({
      locals: { flags: {} },
    })
    await startPage(mockReq(), res)

    expect(res.locals.searchEndpoint).toEqual('/search-by-name')
    expect(res.render).toHaveBeenCalledWith('pages/startPage')
  })
})
