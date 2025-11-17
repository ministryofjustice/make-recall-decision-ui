import { fakerEN_GB as faker } from '@faker-js/faker/.'
import whenDidSpoAgreeDecisionController from './whenDidSpoAgreeDecision'
import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { getRecommendation, updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {},
      },
    })
    const next = mockNext()
    whenDidSpoAgreeDecisionController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'whenSpoAgreedRecallDate' })
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/whenSpoAgreedDate')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          decisionDateTime: '2023-05-01T12:59:53.000Z',
        },
      },
    })
    const next = mockNext()
    await whenDidSpoAgreeDecisionController.get(mockReq(), res, next)
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

    await whenDidSpoAgreeDecisionController.get(mockReq(), res, mockNext())

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
    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      params: { recommendationId: '1' },
      body: {
        'dateTime-day': '01',
        'dateTime-month': '05',
        'dateTime-year': '2023',
        'dateTime-hour': '12',
        'dateTime-minute': '59',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/1/` },
      },
    })
    const next = mockNext()
    await whenDidSpoAgreeDecisionController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '1',
      token: 'token1',
      valuesToSave: {
        decisionDateTime: '2023-05-01T11:59:00.000Z',
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/1/task-list`)
    expect(next).not.toHaveBeenCalled()
  })
  it('post with invalid data - missing day and month', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '1' },
      body: {
        'dateTime-day': '',
        'dateTime-month': '',
        'dateTime-year': '2023',
        'dateTime-hour': '12',
        'dateTime-minute': '59',
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/1/` },
      },
    })
    const next = mockNext()
    await whenDidSpoAgreeDecisionController.post(req, res, next)

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingDateParts',
        href: '#dateTime-day',
        text: 'The date the SPO agreed the recall must include a day and month',
        name: 'dateTime',
        invalidParts: ['day', 'month'],
        values: { day: '', hour: '12', minute: '59', month: '', year: '2023' },
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })

  it('post with invalid data - date is in the future', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)
    ;(getRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const futureDate = faker.date.future()

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '1' },
      body: {
        'dateTime-day': futureDate.getDay().toString(),
        'dateTime-month': futureDate.getMonth().toString(),
        'dateTime-year': futureDate.getFullYear().toString(),
        'dateTime-hour': futureDate.getHours().toString(),
        'dateTime-minute': futureDate.getMinutes().toString(),
      },
    })

    const res = mockRes({
      token: 'token1',
      locals: {
        recommendation: { personOnProbation: { name: 'Joe Bloggs' } },
        urlInfo: { basePath: `/recommendations/1/` },
      },
    })
    const next = mockNext()
    await whenDidSpoAgreeDecisionController.post(req, res, next)

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'dateMustBeInPast',
        href: '#dateTime-day',
        text: 'The date the SPO agreed the recall must be today or in the past',
        name: 'dateTime',
        invalidParts: ['day', 'month', 'year'],
        values: {
          day: futureDate.getDay().toString(),
          hour: futureDate.getHours().toString(),
          minute: futureDate.getMinutes().toString(),
          month: futureDate.getMonth().toString(),
          year: futureDate.getFullYear().toString(),
        },
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
