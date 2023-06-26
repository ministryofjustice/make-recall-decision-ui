import { mockNext, mockReq, mockRes } from '../../middleware/testutils/mockRequestUtils'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import recommendationApiResponse from '../../../api/responses/get-recommendation.json'
import appointmentNoRecallController from './appointmentNoRecallController'

jest.mock('../../data/makeDecisionApiClient')

describe('get', () => {
  it('load with no data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {},
      },
    })
    const next = mockNext()
    await appointmentNoRecallController.get(mockReq(), res, next)

    expect(res.locals.page).toEqual({ id: 'nextAppointment' })
    expect(res.locals.inputDisplayValues.value).not.toBeDefined()
    expect(res.render).toHaveBeenCalledWith('pages/recommendations/nextAppointment')

    expect(next).toHaveBeenCalled()
  })

  it('load with existing data', async () => {
    const res = mockRes({
      locals: {
        recommendation: {
          nextAppointment: {
            howWillAppointmentHappen: {
              selected: 'TELEPHONE',
              allOptions: [
                { value: 'TELEPHONE', text: 'Telephone' },
                { value: 'VIDEO_CALL', text: 'Video call' },
                { value: 'OFFICE_VISIT', text: 'Office visit' },
                { value: 'HOME_VISIT', text: 'Home visit' },
              ],
            },
            dateTimeOfAppointment: '2023-05-01T11:59:00.000Z',
            probationPhoneNumber: '01277 960 001',
          },
        },
      },
    })
    const next = mockNext()
    await appointmentNoRecallController.get(mockReq(), res, next)

    expect(res.locals.inputDisplayValues).toEqual({
      dateTimeOfAppointment: {
        values: { year: '2023', month: '05', day: '01', hour: '12', minute: '59' },
      },
      howWillAppointmentHappen: 'TELEPHONE',
      probationPhoneNumber: '01277 960 001',
    })
  })

  it('initial load with error data', async () => {
    const res = mockRes({
      locals: {
        unsavedValues: { recallType: 'STANDARD' },
        errors: {
          list: [
            {
              name: 'dateTimeOfAppointment',
              href: '#dateTimeOfAppointment-day',
              values: { day: '', month: '', year: '', hour: '12', minute: '59' },
              errorId: 'missingDate',
              html: 'The date and time of the appointment must include a date',
            },
          ],
          dateTimeOfAppointment: {
            text: 'The date and time of the appointment must include a date',
            href: '#dateTimeOfAppointment-day',
            values: { day: '', month: '', year: '', hour: '12', minute: '59' },
            errorId: 'missingDate',
          },
        },
      },
    })

    await appointmentNoRecallController.get(mockReq(), res, mockNext())

    expect(res.locals.errors).toEqual({
      list: [
        {
          html: 'The date and time of the appointment must include a date',
          href: '#dateTimeOfAppointment-day',
          errorId: 'missingDate',
          name: 'dateTimeOfAppointment',
          values: {
            day: '',
            hour: '12',
            minute: '59',
            month: '',
            year: '',
          },
        },
      ],
      dateTimeOfAppointment: {
        text: 'The date and time of the appointment must include a date',
        href: '#dateTimeOfAppointment-day',
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

    const basePath = `/recommendations/123/`
    const req = mockReq({
      params: { recommendationId: '123' },
      body: {
        createLetterTasksComplete: '1',
        howWillAppointmentHappen: 'TELEPHONE',
        'dateTimeOfAppointment-day': '01',
        'dateTimeOfAppointment-month': '05',
        'dateTimeOfAppointment-year': '2025',
        'dateTimeOfAppointment-hour': '12',
        'dateTimeOfAppointment-minute': '59',
        probationPhoneNumber: '01277 960 001',
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

    await appointmentNoRecallController.post(req, res, next)

    expect(updateRecommendation).toHaveBeenCalledWith({
      recommendationId: '123',
      token: 'token1',
      valuesToSave: {
        nextAppointment: {
          dateTimeOfAppointment: '2025-05-01T11:59:00.000Z',
          howWillAppointmentHappen: {
            allOptions: [
              {
                text: 'Telephone',
                value: 'TELEPHONE',
              },
              {
                text: 'Video call',
                value: 'VIDEO_CALL',
              },
              {
                text: 'Office visit',
                value: 'OFFICE_VISIT',
              },
              {
                text: 'Home visit',
                value: 'HOME_VISIT',
              },
            ],
            selected: 'TELEPHONE',
          },
          probationPhoneNumber: '01277 960 001',
        },
      },
      featureFlags: {},
    })

    expect(res.redirect).toHaveBeenCalledWith(303, `/recommendations/123/preview-no-recall`)
    expect(next).not.toHaveBeenCalled() // end of the line for posts.
  })

  it('post with invalid data', async () => {
    ;(updateRecommendation as jest.Mock).mockResolvedValue(recommendationApiResponse)

    const req = mockReq({
      originalUrl: 'some-url',
      params: { recommendationId: '123' },
      body: {
        createLetterTasksComplete: '1',
        howWillAppointmentHappen: 'TELEPHONE',
        'dateTimeOfAppointment-day': '01',
        'dateTimeOfAppointment-month': '05',
        'dateTimeOfAppointment-year': '2025',
        'dateTimeOfAppointment-hour': '12',
        'dateTimeOfAppointment-minute': '59',
        probationPhoneNumber: '',
      },
    })

    const res = mockRes({
      locals: {
        user: { token: 'token1' },
        recommendation: { personOnProbation: { name: 'Harry Smith' } },
        urlInfo: { basePath: `/recommendations/123/` },
      },
    })

    await appointmentNoRecallController.post(req, res, mockNext())

    expect(updateRecommendation).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        errorId: 'missingProbationPhoneNumber',
        href: '#probationPhoneNumber',
        text: 'You must give a telephone number for probation',
        name: 'probationPhoneNumber',
        invalidParts: undefined,
        values: undefined,
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, `some-url`)
  })
})
