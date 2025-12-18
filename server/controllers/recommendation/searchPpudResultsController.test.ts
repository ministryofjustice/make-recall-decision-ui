import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import searchPpudController from './searchPpudResultsController'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import { getRecommendation, ppudDetails, updateRecommendation } from '../../data/makeDecisionApiClient'
import { PpudSearchResult } from '../../@types/make-recall-decision-api/models/ppudSearchResult'
import { PpudOffender } from '../../@types/make-recall-decision-api/models/RecommendationResponse'

jest.mock('../../data/makeDecisionApiClient')
jest.mock('../../monitoring/azureAppInsights')

const PPUD_DETAILS_TEMPLATE: { offender: PpudOffender } = {
  offender: {
    id: '4F6666656E64657269643D313731383138G725H664',
    croOtherNumber: '123456/12A',
    dateOfBirth: '2000-01-01',
    ethnicity: 'White',
    familyName: 'Doe',
    firstNames: 'John',
    gender: 'Male',
    immigrationStatus: 'British',
    nomsId: 'JG123POE',
    prisonerCategory: 'Incarcerated',
    prisonNumber: '1234567A',
    establishment: 'HMP Test Prison',
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
        familyName: 'Doe',
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
        familyName: 'Doe',
        dateOfBirth: '2000-01-01',
      },
    ])

    expect(res.render).toHaveBeenCalledWith(`pages/recommendations/searchPpudResults`)
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  beforeEach(() => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(ppudDetails as jest.Mock).mockResolvedValue(PPUD_DETAILS_TEMPLATE)
  })
  const basePath = `/recommendations/1/`
  const res = mockRes({
    token: 'token1',
    locals: {
      user: { token: 'token1' },
      urlInfo: { basePath },
      flags: { xyz: true },
    },
  })

  it('post with valid data', async () => {
    const req = mockReq({
      params: { recommendationId: '1' },
      body: {
        id: '4F6666656E64657269643D313731383138G725H664',
      },
    })

    const next = mockNext()

    await searchPpudController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookRecallToPpud: null,
        ppudOffender: PPUD_DETAILS_TEMPLATE.offender,
      },
      token: 'token1',
      featureFlags: {
        xyz: true,
      },
    })
    expect(ppudDetails).toHaveBeenCalledWith('token1', '4F6666656E64657269643D313731383138G725H664')
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/check-booking-details`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
  it('post with null ppudOffender if no ID is provided', async () => {
    const req = mockReq({
      params: { recommendationId: '1' },
    })
    const next = mockNext()

    await searchPpudController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        ppudOffender: null,
      },
      token: 'token1',
      featureFlags: {
        xyz: true,
      },
    })
    expect(ppudDetails).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/check-booking-details`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
  it('post with null bookRecallToPpud when we change records', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      bookRecallToPpud: {
        ppudOffender: {
          id: '4F6666656E64657269643D313731383138G725H664',
        },
      },
    })
    const req = mockReq({
      params: { recommendationId: '1' },
      body: {
        id: '4F6666656E64657269643D313345435353RE231',
      },
    })
    const next = mockNext()

    await searchPpudController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        ppudOffender: PPUD_DETAILS_TEMPLATE.offender,
        bookRecallToPpud: null,
      },
      token: 'token1',
      featureFlags: {
        xyz: true,
      },
    })
    expect(ppudDetails).toHaveBeenCalledWith('token1', '4F6666656E64657269643D313345435353RE231')
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/check-booking-details`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
  it("don't clear bookRecallToPpud value if we reselect the active record", async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      ppudOffender: {
        id: '4F6666656E64657269643D313731383138G725H664',
      },
    })
    const req = mockReq({
      params: { recommendationId: '1' },
      body: {
        id: '4F6666656E64657269643D313731383138G725H664',
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
    expect(ppudDetails).toHaveBeenCalledWith('token1', '4F6666656E64657269643D313731383138G725H664')
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/check-booking-details`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
  it('post with null ppudOffender and bookRecallToPpud when we change from an existing record to a new one', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      bookRecallToPpud: {
        ppudOffender: {
          id: 10,
        },
      },
    })
    const req = mockReq({
      params: { recommendationId: '1' },
      body: {
        id: '',
      },
    })
    const next = mockNext()
    await searchPpudController.post(req, res, next)
    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        ppudOffender: null,
        bookRecallToPpud: null,
      },
      token: 'token1',
      featureFlags: {
        xyz: true,
      },
    })
    expect(ppudDetails).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/check-booking-details`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
  it("Don't clear bookRecallToPpud value if we leave then return to a new record booking", async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
    })
    const req = mockReq({
      params: { recommendationId: '1' },
    })

    const next = mockNext()
    await searchPpudController.post(req, res, next)
    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        ppudOffender: null,
      },
      token: 'token1',
      featureFlags: {
        xyz: true,
      },
    })
    expect(ppudDetails).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/check-booking-details`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })
})
