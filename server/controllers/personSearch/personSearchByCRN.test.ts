import { personSearchByCRN } from './personSearchByCRN'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'

describe('personSearchByCRN', () => {
  it('normal operation', async () => {
    const res = mockRes({
      locals: { flags: {} },
    })
    await personSearchByCRN(mockReq(), res)

    expect(res.render).toHaveBeenCalledWith('pages/personSearchByCRN')
  })
})
