import { findaRecallRequestByCRN } from './findaRecallRequestByCRN'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'

describe('findaRecallRequestByCRN', () => {
  it('normal operation', async () => {
    const res = mockRes({
      locals: { flags: {} },
    })
    await findaRecallRequestByCRN(mockReq(), res)

    expect(res.render).toHaveBeenCalledWith('pages/findaRecallRequestByCRN')
  })
})
