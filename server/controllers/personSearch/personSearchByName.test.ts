import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { personSearchByName } from './personSearchByName'

describe('personSearchByName', () => {
  it('normal operation', async () => {
    const res = mockRes({
      locals: { flags: {} },
    })
    await personSearchByName(mockReq(), res)

    expect(res.render).toHaveBeenCalledWith('pages/personSearchByName')
  })
})
