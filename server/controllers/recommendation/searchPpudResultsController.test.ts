import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import searchPpudController from './searchPpudResultsController'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import { updateRecommendation, searchPpud, ppudDetails } from '../../data/makeDecisionApiClient'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../../monitoring/azureAppInsights')

const PPUD_DETAILS_TEMPLATE = {
  offender: {
    id: 'string',
    croOtherNumber: 'string',
    dateOfBirth: '2000-01-01',
    ethnicity: 'Caucasian',
    familyName: 'Teal',
    firstNames: 'John',
    gender: 'Male',
    immigrationStatus: 'British',
    nomsId: 'JG123POE',
    prisonerCategory: 'Incarcerated',
    prisonNumber: '1234567A',
    sentences: [
      {
        dateOfSentence: '2024-01-05',
        custodyType: 'Standard',
        mappaLevel: 'Level 5',
      },
    ],
    status: 'ACTIVE',
    youngOffender: 'NO',
  },
}

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

describe('post', () => {
  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(ppudDetails as jest.Mock).mockResolvedValue(PPUD_DETAILS_TEMPLATE)

    const basePath = `/recommendations/1/`
    const req = mockReq({
      params: { recommendationId: '1' },
      body: {
        id: '1234',
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

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        ppudOffender: PPUD_DETAILS_TEMPLATE.offender,
      },
      token: 'token1',
      featureFlags: {
        xyz: true,
      },
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/check-booking-details`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
})
