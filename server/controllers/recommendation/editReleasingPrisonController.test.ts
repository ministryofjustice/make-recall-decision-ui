import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, ppudReferenceList, updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import editReleasingPrisonController from './editReleasingPrisonController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load', async () => {
    ;(ppudReferenceList as jest.Mock).mockResolvedValue({ values: ['one', 'two', 'three'] })

    const req = mockReq({
      params: {
        recommendationId: '123',
      },
    })

    const res = mockRes()
    const next = mockNext()
    await editReleasingPrisonController.get(req, res, next)

    expect(ppudReferenceList).toHaveBeenCalledWith('token', 'establishments')

    expect(res.locals.page).toEqual({ id: 'editReleasingPrison' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/editReleasingPrison')
    expect(res.locals.releasingPrisons).toEqual([
      { text: 'one', value: 'one' },
      { text: 'two', value: 'two' },
      { text: 'three', value: 'three' },
    ])
    expect(next).toHaveBeenCalled()
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
        releasingPrison: 'home-bound',
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

    await editReleasingPrisonController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookRecallToPpud: {
          policeForce: 'Kent',
          releasingPrison: 'home-bound',
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
  it('post with invalid data', async () => {
    const basePath = `/recommendations/1/`
    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '1' },
      body: {},
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

    await editReleasingPrisonController.post(req, res, next)

    expect(req.session.errors).toEqual([
      {
        errorId: 'missingReleasingPrison',
        invalidParts: undefined,
        href: '#releasingPrison',
        name: 'releasingPrison',
        text: 'Select a releasing prison from the list',
        values: undefined,
      },
    ])

    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
