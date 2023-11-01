import { createClient } from 'redis'
import { getCaseSummary } from '../../data/makeDecisionApiClient'
import { mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { personSearchInPpud } from './personSearchInPpud'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('redis')

describe('personSearchInPpudResults', () => {
  beforeEach(() => {
    ;(createClient as jest.Mock).mockReturnValue({
      connect: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
    })
  })
  it('normal operation', async () => {
    const apiResponse = { personalDetailsOverview: {} }
    ;(getCaseSummary as jest.Mock).mockResolvedValue(apiResponse)
    const res = mockRes({
      locals: { flags: {} },
    })
    await personSearchInPpud(mockReq(), res)
    expect(res.render).toHaveBeenCalledWith('pages/personSearchInPpudResults')
  })
})
