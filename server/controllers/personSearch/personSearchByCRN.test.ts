import { personSearchByCRN } from './personSearchByCRN'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'

describe('personSearchByCRN', () => {
  it('normal operation', async () => {
    const res = mockRes({
      locals: { flags: {} },
    })
    await personSearchByCRN(mockReq(), res)

    expect(res.render).toHaveBeenCalledWith('pages/personSearch')
  })

  it('operation when flag search by name is active', async () => {
    const res = mockRes({
      locals: {
        flags: {
          flagSearchByName: true,
        },
      },
    })
    await personSearchByCRN(mockReq(), res)

    expect(res.render).toHaveBeenCalledWith('pages/personSearchByCRN')
  })
})
