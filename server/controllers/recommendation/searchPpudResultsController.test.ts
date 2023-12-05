import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import searchPpudController from './searchPpudResultsController'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import { updateRecommendation, searchPpud } from '../../data/makeDecisionApiClient'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../../monitoring/azureAppInsights')

describe('get', () => {
  it('load', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    const req = mockReq({
      params: { recommendationId: '123' },
    })
    ;(searchPpud as jest.Mock).mockResolvedValue({
      results: [
        {
          id: '4F6666656E64657269643D313731383138G725H664',
          croNumber: '123456/12A',
          nomsId: 'JG123POE',
          firstNames: 'John',
          familyName: 'Teal',
          dateOfBirth: '2000-01-01',
        },
      ],
    })

    const res = mockRes({
      locals: {
        recommendation: {
          personOnProbation: {
            croNumber: '123X',
            nomsNumber: '567Y',
            surname: 'Mayer',
            dateOfBirth: '2001-01-01',
          },
        },
        token: 'token1',
      },
    })
    const next = mockNext()
    await searchPpudController.get(req, res, next)
    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token',
      valuesToSave: {
        ppudRecordPresent: true,
      },
      featureFlags: {},
    })

    expect(res.locals.page).toEqual({ id: 'searchPpudResults' })
    expect(res.locals.results).toEqual([
      {
        id: '4F6666656E64657269643D313731383138G725H664',
        croNumber: '123456/12A',
        nomsId: 'JG123POE',
        firstNames: 'John',
        familyName: 'Teal',
        dateOfBirth: '2000-01-01',
      },
    ])

    expect(next).toHaveBeenCalled()
  })
  it('load when no results', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(searchPpud as jest.Mock).mockResolvedValue({
      results: [],
    })
    const req = mockReq({
      params: { recommendationId: '123' },
    })
    const res = mockRes({
      locals: {
        user: { username: 'Bill', region: { code: 'N07', name: 'London' } },
        recommendation: {
          crn: 'abc',
          personOnProbation: {
            fullName: 'Mr McMacintosh',
          },
        },
        token: 'token',
      },
    })
    const next = mockNext()

    await searchPpudController.get(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token',
      valuesToSave: {
        ppudRecordPresent: false,
      },
      featureFlags: {},
    })

    expect(res.locals.page).toEqual({ id: 'noSearchPpudResults' })
    expect(res.locals.results).toEqual([])

    expect(next).not.toHaveBeenCalled()
    expect(appInsightsEvent).toHaveBeenCalledWith(
      'mrdNoPpudSearchResultsPageView',
      'Bill',
      {
        crn: 'abc',
        pageUrlSlug: 'no-ppud-search-results',
        region: { code: 'N07', name: 'London' },
      },
      {}
    )
  })
})
