import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, ppudReferenceList, updateRecommendation } from '../../data/makeDecisionApiClient'
import editCustodyTypeController from './editCustodyTypeController'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'

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
    await editCustodyTypeController.get(req, res, next)

    expect(ppudReferenceList).toHaveBeenCalledWith('token', 'custody-types')

    expect(res.locals.page).toEqual({ id: 'editCustodyType' })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/editCustodyType')
    expect(res.locals.custodyTypes).toEqual([
      { text: '-', value: '' },
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
        custodyType: 'home-bound',
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

    await editCustodyTypeController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookRecallToPpud: {
          policeForce: 'Kent',
          custodyType: 'home-bound',
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

    await editCustodyTypeController.post(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
