import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, searchForPpcs } from '../../data/makeDecisionApiClient'
import ppcsSearchResultsController from './ppcsSearchResultsController'
import { StageEnum } from '../../booking/StageEnum'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    ;(searchForPpcs as jest.Mock).mockResolvedValue({
      results: [
        {
          name: 'Joe Bloggs',
          crn: 'X098092',
          dateOfBirth: '1980-05-06',
          recommendationId: 799270715,
        },
      ],
    })
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      bookingMemento: undefined,
    })

    const res = mockRes()
    const next = mockNext()
    await ppcsSearchResultsController.get(mockReq({ query: { crn: '123' } }), res, next)

    expect(res.locals.page).toEqual({ id: 'ppcsSearchResults' })
    expect(res.render).toHaveBeenCalledWith('pages/ppcsSearchResults')

    expect(res.locals.bookingOnStarted).toEqual(false)
    expect(res.locals.crn).toEqual('123')
    expect(res.locals.result).toEqual({
      name: 'Joe Bloggs',
      crn: 'X098092',
      dateOfBirth: '1980-05-06',
      recommendationId: 799270715,
    })
    expect(next).toHaveBeenCalled()
  })
  it('load - with booking on started', async () => {
    ;(searchForPpcs as jest.Mock).mockResolvedValue({
      results: [
        {
          name: 'Joe Bloggs',
          crn: 'X098092',
          dateOfBirth: '1980-05-06',
          recommendationId: 799270715,
        },
      ],
    })
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      bookingMemento: {
        stage: StageEnum.STARTED,
      },
    })

    const res = mockRes()
    const next = mockNext()
    await ppcsSearchResultsController.get(mockReq({ query: { crn: '123' } }), res, next)

    expect(res.locals.bookingOnStarted).toEqual(true)
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
  it('redirect if crn is blank', async () => {
    const res = mockRes()
    const next = mockNext()
    await ppcsSearchResultsController.get(mockReq({ query: { crn: '' } }), res, next)

    expect(searchForPpcs).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith(303, 'no-ppcs-search-results?crn=')
    expect(next).not.toHaveBeenCalled()
  })
})
