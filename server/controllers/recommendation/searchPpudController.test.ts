import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import searchPpudController from './searchPpudController'
import { searchPpud } from '../../data/makeDecisionApiClient'
import { PpudSearchResult } from '../../@types/make-recall-decision-api/models/ppudSearchResult'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../../monitoring/azureAppInsights')

describe('get', () => {
  it('load', async () => {
    const res = mockRes({
      locals: {
        recommendation: { crn: 'X123' },
      },
    })
    const next = mockNext()
    await searchPpudController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'searchPpud' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/searchPpud')

    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('post with some results', async () => {
    const results = [
      {
        id: '4F6666656E64657269643D313731383138G725H664',
        croNumber: '123456/12A',
        nomsId: 'JG123POE',
        firstNames: 'John',
        familyName: 'Doe',
        dateOfBirth: '2000-01-01',
      },
    ]

    ;(searchPpud as jest.Mock).mockResolvedValue({ results })

    const basePath = `/recommendations/1/`
    const req = mockReq({
      params: { recommendationId: '1' },
      body: {
        crn: 'X123',
        croNumber: '678',
        nomsNumber: '234',
        surname: 'Bloggs',
        dateOfBirth: '1980-10-02',
        fullName: 'Joe',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        user: { token: 'token1' },
        urlInfo: { basePath },
        flags: { xyz: true },
      },
    })
    const next = mockNext()

    await searchPpudController.post(req, res, next)

    expect(searchPpud).toHaveBeenCalledWith('token1', '678', '234', 'Bloggs', '1980-10-02')

    expect(req.session.ppudSearchResults).toEqual(results)
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/search-ppud-results`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with no results', async () => {
    const results: PpudSearchResult[] = []

    ;(searchPpud as jest.Mock).mockResolvedValue({ results })

    const basePath = `/recommendations/1/`
    const req = mockReq({
      params: { recommendationId: '1' },
      body: {
        crn: 'X123',
        croNumber: '678',
        nomsNumber: '234',
        surname: 'Bloggs',
        dateOfBirth: '1980-10-02',
        fullName: 'Joe',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        user: { token: 'token1', region: 'en-uk' },
        urlInfo: { basePath },
        flags: { xyz: true },
      },
    })
    const next = mockNext()

    await searchPpudController.post(req, res, next)

    expect(searchPpud).toHaveBeenCalledWith('token1', '678', '234', 'Bloggs', '1980-10-02')

    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdNoPpudSearchResultsPageView',
      undefined,
      {
        crn: 'X123',
        pageUrlSlug: 'no-ppud-search-results',
        region: 'en-uk',
      },
      { xyz: true }
    )

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/no-search-ppud-results`)
    expect(req.session.fullName).toEqual('Joe')
    expect(req.session.crn).toEqual('X123')
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
})
