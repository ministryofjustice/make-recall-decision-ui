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

    const res = mockRes({
      locals: {
        recommendation: { crn: 'X123' },
      },
    })
    const next = mockNext()
    await ppcsSearchResultsController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'ppcsSearchResults' })
    expect(res.render).toHaveBeenCalledWith('pages/ppcsSearchResults')

    expect(res.locals.result).toEqual({
      name: 'Harry Smith',
      crn: 'X098092',
      dateOfBirth: '1980-05-06',
      recommendationId: 799270715,
    })

    expect(next).toHaveBeenCalled()
  })
  it('load no results', async () => {
    ;(searchForPpcs as jest.Mock).mockResolvedValue({
      results: [],
    })

    const res = mockRes({
      locals: {
        recommendation: { crn: 'X123' },
      },
    })
    const next = mockNext()
    await ppcsSearchResultsController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'ppcsSearchResults' })
    expect(res.render).toHaveBeenCalledWith('pages/ppcsSearchResults')

    expect(res.locals.result).toBeUndefined()

    expect(next).toHaveBeenCalled()
  })
})
