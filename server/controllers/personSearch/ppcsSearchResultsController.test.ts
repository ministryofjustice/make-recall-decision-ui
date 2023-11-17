import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { searchForPpcs } from '../../data/makeDecisionApiClient'
import ppcsSearchResultsController from './ppcsSearchResultsController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    ;(searchForPpcs as jest.Mock).mockResolvedValue({
      results: [
        {
          name: 'Harry Smith',
          crn: 'X098092',
          dateOfBirth: '1980-05-06',
          recommendationId: 799270715,
        },
      ],
    })

    const res = mockRes()
    const next = mockNext()
    await ppcsSearchResultsController.get(mockReq({ query: { crn: '123' } }), res, next)

    expect(res.locals.page).toEqual({ id: 'ppcsSearchResults' })
    expect(res.render).toHaveBeenCalledWith('pages/ppcsSearchResults')

    expect(res.locals.crn).toEqual('123')
    expect(res.locals.result).toEqual({
      name: 'Harry Smith',
      crn: 'X098092',
      dateOfBirth: '1980-05-06',
      recommendationId: 799270715,
    })
    expect(next).toHaveBeenCalled()
  })
  it('redirect if no results', async () => {
    ;(searchForPpcs as jest.Mock).mockResolvedValue({
      results: [],
    })

    const res = mockRes()
    const next = mockNext()
    await ppcsSearchResultsController.get(mockReq({ query: { crn: '123' } }), res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, 'no-ppcs-search-results?crn=123')
    expect(next).not.toHaveBeenCalled()
  })
})
