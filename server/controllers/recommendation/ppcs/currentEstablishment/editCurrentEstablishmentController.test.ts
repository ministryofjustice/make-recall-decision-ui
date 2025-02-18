import { getRecommendation, ppudReferenceList, updateRecommendation } from '../../../../data/makeDecisionApiClient'
import { mockNext, mockReq, mockRes } from '../../../../middleware/testutils/mockRequestUtils'
import editCurrentEstablishmentController from './editCurrentEstablishmentController'
import recommendationApiResponse from '../../../../../api/responses/get-recommendation.json'
import { nextPageLinkUrl } from '../../../recommendations/helpers/urls'
import {
  extractCurrentEstablishment,
  extractNomisEstablishment,
  extractPpudEstablishment,
} from './recommendationEstablishmentExtractor'

jest.mock('../../../../data/makeDecisionApiClient')
jest.mock('../../../recommendations/helpers/urls')
jest.mock('./recommendationEstablishmentExtractor')

describe('get', () => {
  it('load', async () => {
    const validPpudEstablishments = ['one', 'two', 'three']
    ;(ppudReferenceList as jest.Mock).mockResolvedValue({ values: validPpudEstablishments })
    const expectedNomisEstablishment = 'abc'
    ;(extractNomisEstablishment as jest.Mock).mockReturnValueOnce(expectedNomisEstablishment)
    const expectedPpudEstablishment = 'def'
    ;(extractPpudEstablishment as jest.Mock).mockReturnValueOnce(expectedPpudEstablishment)
    const expectedCurrentEstablishment = 'ghi'
    ;(extractCurrentEstablishment as jest.Mock).mockReturnValueOnce(expectedCurrentEstablishment)

    const req = mockReq()
    const token = 'token'
    const recommendation = {
      prisonOffender: {
        establishment: 'xyz',
      },
      ppudOffender: {
        establishment: 'lmn',
      },
      bookRecallToPpud: {
        currentEstablishment: 'qrs',
      },
    }
    const res = mockRes({
      locals: {
        user: { token },
        recommendation,
      },
    })
    const next = mockNext()
    await editCurrentEstablishmentController.get(req, res, next)

    expect(ppudReferenceList).toHaveBeenCalledWith(token, 'establishments')
    expect(extractNomisEstablishment).toHaveBeenCalledWith(recommendation)
    expect(extractPpudEstablishment).toHaveBeenCalledWith(recommendation)
    expect(extractCurrentEstablishment).toHaveBeenCalledWith(recommendation, validPpudEstablishments)

    expect(res.locals.page).toEqual({ id: 'editCurrentEstablishment' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/editCurrentEstablishment')
    expect(res.locals.nomisEstablishment).toEqual(expectedNomisEstablishment)
    expect(res.locals.ppudEstablishment).toEqual(expectedPpudEstablishment)
    expect(res.locals.currentEstablishment).toEqual(expectedCurrentEstablishment)
    expect(res.locals.establishments).toEqual([
      { text: 'one', value: 'one' },
      { text: 'two', value: 'two' },
      { text: 'three', value: 'three' },
    ])
    expect(next).toHaveBeenCalled()
  })
})

describe('post', () => {
  it('post with valid data', async () => {
    const bookRecallToPpud = {
      policeForce: 'Kent',
    }
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      bookRecallToPpud,
    })
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const recommendationId = recommendationApiResponse.id.toString()
    const currentEstablishment = 'The Kyln'
    const req = mockReq({
      params: { recommendationId },
      body: {
        currentEstablishment,
      },
    })

    const token = 'token1'
    const featureFlags = { xyz: true }
    const urlInfo = { basePath: 'basePath' }
    const res = mockRes({
      token,
      locals: {
        user: { token },
        urlInfo,
        flags: featureFlags,
      },
    })

    const nextPagePath: string = 'nextPagePath'
    const nextPageLink: string = 'nextPageLink'
    ;(nextPageLinkUrl as jest.Mock).mockReturnValueOnce(nextPagePath).mockReturnValueOnce(nextPageLink)

    const next = mockNext()

    await editCurrentEstablishmentController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId,
      valuesToSave: {
        bookRecallToPpud: {
          ...bookRecallToPpud,
          currentEstablishment,
        },
      },
      token,
      featureFlags,
    })

    expect(nextPageLinkUrl).toHaveBeenNthCalledWith(1, { nextPageId: 'check-booking-details', urlInfo })
    expect(nextPageLinkUrl).toHaveBeenNthCalledWith(2, { nextPagePath, urlInfo })
    expect(res.redirect).toHaveBeenCalledWith(303, nextPageLink)
  })
  it('post with invalid data', async () => {
    const recommendationId = '1'
    const originalUrl = 'some-url'
    const req = mockReq({
      originalUrl,
      params: { recommendationId },
      body: {},
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        user: { token: 'token1' },
        urlInfo: { basePath: 'basePath' },
        flags: { xyz: true },
      },
    })
    const next = mockNext()

    await editCurrentEstablishmentController.post(req, res, next)

    expect(req.session.errors).toEqual([
      {
        errorId: 'missingCurrentEstablishment',
        invalidParts: undefined,
        href: '#currentEstablishment',
        name: 'currentEstablishment',
        text: 'Select an establishment from the list',
        values: undefined,
      },
    ])

    expect(res.redirect).toHaveBeenCalledWith(303, originalUrl)
  })
})
