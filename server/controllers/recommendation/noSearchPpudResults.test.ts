import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import noSearchPpudResults from './noSearchPpudResults'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    const res = mockRes({
      locals: {
        recommendation: { crn: 'X123' },
      },
    })
    const next = mockNext()
    await noSearchPpudResults.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'noSearchPpudResults' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/noSearchPpudResults')

    expect(next).toHaveBeenCalled()
  })
})
