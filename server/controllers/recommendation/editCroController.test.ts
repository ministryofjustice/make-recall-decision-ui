import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import editCroController from './editCroController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    const req = mockReq({
      params: {
        recommendationId: '123',
      },
    })

    const res = mockRes({
      locals: {
        recommendation: {
          bookRecallToPpud: { cro: '123456' },
        },
      },
    })
    const next = mockNext()
    await editCroController.get(req, res, next)

    expect(res.locals.page).toEqual({ id: 'editCro' })
    expect(res.locals.values).toEqual({
      cro: '123456',
    })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/editCro')
    expect(next).toHaveBeenCalled()
  })

  it('pre-populates cro from Part A when bookRecallToPpud cro is empty', async () => {
    const req = mockReq({
      params: { recommendationId: '123' },
    })

    const res = mockRes({
      locals: {
        recommendation: {
          bookRecallToPpud: { cro: null },
          prisonOffender: { cro: '789/01A' },
        },
      },
    })
    const next = mockNext()
    await editCroController.get(req, res, next)

    expect(res.locals.values).toEqual({
      cro: '789/01A',
    })
  })

  it('defaults to empty string when both bookRecallToPpud and Part A cro are empty', async () => {
    const req = mockReq({
      params: { recommendationId: '123' },
    })

    const res = mockRes({
      locals: {
        recommendation: {
          bookRecallToPpud: { cro: null },
          prisonOffender: { cro: null },
        },
      },
    })
    const next = mockNext()
    await editCroController.get(req, res, next)

    expect(res.locals.values).toEqual({
      cro: '',
    })
  })
})

describe('post', () => {
  it('post with valid data', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      bookRecallToPpud: {
        policeForce: 'Kent',
      },
    })
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const basePath = `/recommendations/1/`
    const req = mockReq({
      params: { recommendationId: '1' },
      body: {
        cro: '123456',
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

    await editCroController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookRecallToPpud: {
          policeForce: 'Kent',
          cro: '123456',
        },
      },
      token: 'token1',
      featureFlags: {
        xyz: true,
      },
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/check-booking-details`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with empty cro when Part A and PPUD cro are also empty returns validation error', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      bookRecallToPpud: {
        policeForce: 'Kent',
      },
      prisonOffender: { cro: null },
      ppudOffender: { croOtherNumber: null },
    })

    const req = mockReq({
      params: { recommendationId: '1' },
      body: {
        cro: '',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        user: { token: 'token1' },
        urlInfo: { basePath: `/recommendations/1/` },
        flags: { xyz: true },
      },
    })
    const next = mockNext()

    await editCroController.post(req, res, next)

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingCro',
        href: '#cro',
        name: 'cro',
        text: 'Enter the CRO',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, req.originalUrl)
  })

  it('post with empty cro when Part A cro exists allows submission', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      bookRecallToPpud: {
        policeForce: 'Kent',
      },
      prisonOffender: { cro: '789/01A' },
      ppudOffender: { croOtherNumber: null },
    })
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: { recommendationId: '1' },
      body: {
        cro: '',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        user: { token: 'token1' },
        urlInfo: { basePath: `/recommendations/1/` },
        flags: { xyz: true },
      },
    })
    const next = mockNext()

    await editCroController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/check-booking-details`)
  })

  it('post with empty cro when PPUD cro exists allows submission', async () => {
    ;(getRecommendation as jest.Mock).mockResolvedValue({
      ...recommendationApiResponse,
      bookRecallToPpud: {
        policeForce: 'Kent',
      },
      prisonOffender: { cro: null },
      ppudOffender: { croOtherNumber: '456/02B' },
    })
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: { recommendationId: '1' },
      body: {
        cro: '',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        user: { token: 'token1' },
        urlInfo: { basePath: `/recommendations/1/` },
        flags: { xyz: true },
      },
    })
    const next = mockNext()

    await editCroController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/check-booking-details`)
  })
})
