import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import editDateOfBirthController from './editDateOfBirthController'

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
          bookRecallToPpud: { dateOfBirth: '2003-01-01' },
        },
      },
    })
    const next = mockNext()
    await editDateOfBirthController.get(req, res, next)

    expect(res.locals.page).toEqual({ id: 'editDateOfBirth' })
    expect(res.locals.dateOfBirth).toEqual({
      day: '01',
      month: '01',
      year: '2003',
    })
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/editDateOfBirth')
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
        unsavedValues: { day: '05', month: '02', year: '2003' },
      },
    })
    const next = mockNext()
    await editDateOfBirthController.get(req, res, next)

    expect(res.locals.page).toEqual({ id: 'editDateOfBirth' })
    expect(res.locals.dateOfBirth).toEqual({
      day: '05',
      month: '02',
      year: '2003',
    })
    expect(res.locals.errors).toEqual([])
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/editDateOfBirth')
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
        day: '02',
        month: '09',
        year: '2001',
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

    await editDateOfBirthController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      valuesToSave: {
        bookRecallToPpud: {
          policeForce: 'Kent',
          dateOfBirth: '2001-09-02',
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

    await editDateOfBirthController.post(req, res, next)

    expect(req.session.errors).toEqual([
      {
        errorId: 'blankDateTime',
        href: '#dateOfBirth-day',
        invalidParts: ['day', 'month', 'year'],
        name: 'dateOfBirth',
        text: 'Enter the date of birth',
        values: {
          day: undefined,
          month: undefined,
          year: undefined,
        },
      },
    ])

    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
