import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import searchPpudController from './searchPpudResultsController'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import { ppudDetails, updateRecommendation } from '../../data/makeDecisionApiClient'
import { PpudSearchResult } from '../../@types/make-recall-decision-api/models/ppudSearchResult'

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
    const results = [
      {
        id: '4F6666656E64657269643D313731383138G725H664',
        croNumber: '123456/12A',
        nomsId: 'JG123POE',
        firstNames: 'John',
        familyName: 'Teal',
        dateOfBirth: '2000-01-01',
      },
    ]

    const req = mockReq({
      params: { recommendationId: '123' },
      session: { ppudSearchResults: results as PpudSearchResult[], cookie: undefined },
    })

    const res = mockRes({})
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

    expect(res.render).toHaveBeenCalledWith(`pages/recommendations/searchPpudResults`)
    expect(next).toHaveBeenCalled()
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
