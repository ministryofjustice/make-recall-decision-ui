import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { findaRecallRequestByName } from './findaRecallRequestByName'

describe('findaRecallRequestByName', () => {
  it('normal operation', async () => {
    const res = mockRes({
      locals: { flags: {} },
    })
    await findaRecallRequestByName(mockReq(), res)

    expect(res.render).toHaveBeenCalledWith('pages/findaRecallRequestByName')
  })
})
