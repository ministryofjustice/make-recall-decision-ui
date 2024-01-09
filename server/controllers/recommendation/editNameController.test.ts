import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import editNameController from './editNameController'

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
          bookRecallToPpud: { firstNames: 'Harrison C', lastName: 'Ford' },
        },
      },
    })
    const next = mockNext()
    await editNameController.get(req, res, next)

    expect(res.locals.page).toEqual({ id: 'editName' })
    expect(res.locals.values).toEqual({
      firstNames: 'Harrison C',
      lastName: 'Ford',
    })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/editName')
    expect(next).toHaveBeenCalled()
  })
  it('load with errors', async () => {
    const req = mockReq({
      params: {
        recommendationId: '123',
      },
    })

    const res = mockRes({
      locals: {
        errors: [],
        unsavedValues: {
          firstName: 'Ethan',
          lastName: 'Hawk',
          secondName: 'H',
        },
        recommendation: {
          bookRecallToPpud: { firstNames: 'Harrison C', lastName: 'Ford' },
        },
      },
    })
    const next = mockNext()
    await editNameController.get(req, res, next)

    expect(res.locals.page).toEqual({ id: 'editName' })
    expect(res.locals.errors).toEqual([])
    expect(res.locals.values).toEqual({
      firstName: 'Ethan',
      lastName: 'Hawk',
      secondName: 'H',
    })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/editName')
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
        firstNames: 'Al Bert',
        lastName: 'Zweitestein',
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

    await editNameController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookRecallToPpud: {
          policeForce: 'Kent',
          firstNames: 'Al Bert',
          lastName: 'Zweitestein',
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

    await editNameController.post(req, res, next)

    expect(req.session.errors).toEqual([
      {
        errorId: 'missingFirstNames',
        invalidParts: undefined,
        href: '#firstNames',
        name: 'firstNames',
        text: 'Enter a first name(s)',
        values: undefined,
      },
      {
        errorId: 'missingLastName',
        invalidParts: undefined,
        href: '#lastName',
        name: 'lastName',
        text: 'Enter a last name',
        values: undefined,
      },
    ])

    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
