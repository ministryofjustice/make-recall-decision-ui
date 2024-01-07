import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import editRecallReceivedController from './editRecallReceivedController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {},
      },
    })
    const next = mockNext()
    await editRecallReceivedController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'editRecallReceived' })
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/editRecallReceived')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          bookRecallToPpud: { receivedDateTime: '2023-05-01T12:59:53.000Z' },
        },
      },
    })
    const next = mockNext()
    await editRecallReceivedController.get(mockReq(), res, next)
    expect(res.locals.inputDisplayValues).toEqual({
      dateTime: {
        values: { year: '2023', month: '05', day: '01', hour: '13', minute: '59' },
      },
    })
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {},
        errors: {
          list: [
            {
              name: 'dateTime',
              href: '#dateTime-day',
              values: { day: '', month: '', year: '', hour: '12', minute: '59' },
              errorId: 'missingDate',
              html: 'The date and time must include a date',
            },
          ],
          dateTime: {
            text: 'The date and time must include a date',
            href: '#dateTime-day',
            values: { day: '', month: '', year: '', hour: '12', minute: '59' },
            errorId: 'missingDate',
          },
        },
      },
    })

    await editRecallReceivedController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      list: [
        {
          html: 'The date and time must include a date',
          href: '#dateTime-day',
          errorId: 'missingDate',
          name: 'dateTime',
          values: {
            day: '',
            hour: '12',
            minute: '59',
            month: '',
            year: '',
          },
        },
      ],
      dateTime: {
        text: 'The date and time must include a date',
        href: '#dateTime-day',
        errorId: 'missingDate',
        values: {
          day: '',
          hour: '12',
          minute: '59',
          month: '',
          year: '',
        },
      },
    })
  })
})

describe('post', () => {
  it('post with valid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(getRecommendation as jest.Mock).mockReturnValueOnce(recommendationApiResponse)

    const basePath = `/recommendations/1/`
    const req = mockReq({
      params: { recommendationId: '1' },
      body: {
        'dateTime-day': '01',
        'dateTime-month': '05',
        'dateTime-year': '2025',
        'dateTime-hour': '12',
        'dateTime-minute': '59',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath },
      },
    })
    const next = mockNext()

    await editRecallReceivedController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      token: 'token1',
      valuesToSave: {
        bookRecallToPpud: { receivedDateTime: '2025-05-01T11:59:00.000Z' },
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/check-booking-details`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(getRecommendation as jest.Mock).mockReturnValueOnce(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '1' },
      body: {
        'dateTime-day': '',
        'dateTime-month': '',
        'dateTime-year': '2025',
        'dateTime-hour': '12',
        'dateTime-minute': '59',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/1/` },
      },
    })

    await editRecallReceivedController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingDateParts',
        href: '#dateTime-day',
        text: 'The date and time must include a day and month',
        name: 'dateTime',
        invalidParts: ['day', 'month'],
        values: { day: '', hour: '12', minute: '59', month: '', year: '2025' },
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
