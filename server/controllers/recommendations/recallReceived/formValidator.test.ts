import { DateTime } from 'luxon'
import { validateRecallReceived } from './formValidator'

describe('validateRecallReceived', () => {
  const recommendationId = '34'
  const urlInfo = {
    currentPageId: 'edit-recall-received-date-and-time',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/check-booking-details`,
  }
  const { year } = DateTime.now().plus({ years: 1 })

  it('returns valuesToSave and no errors, and redirects to preview, if valid', async () => {
    const requestBody = {
      'dateTime-day': '12',
      'dateTime-month': '05',
      'dateTime-year': year.toString(),
      'dateTime-hour': '12',
      'dateTime-minute': '53',
    }
    const { errors, valuesToSave, nextPagePath } = await validateRecallReceived({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({ receivedDateTime: '2025-05-12T11:53:00.000Z' })
    expect(nextPagePath).toEqual('/recommendations/34/check-booking-details')
  })

  it('returns errors, if not set, and no valuesToSave', async () => {
    const requestBody = {
      'dateTimeOfAppointment-day': '',
      'dateTimeOfAppointment-month': '',
      'dateTimeOfAppointment-year': '',
      'dateTimeOfAppointment-hour': '',
      'dateTimeOfAppointment-minute': '',
    }
    const { errors, valuesToSave } = await validateRecallReceived({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'blankDateTime',
        href: '#dateTime-day',
        invalidParts: ['day', 'month', 'year', 'hour', 'minute'],
        name: 'dateTime',
        text: 'Enter the date and time',
        values: {
          day: undefined,
          hour: undefined,
          minute: undefined,
          month: undefined,
          year: undefined,
        },
      },
    ])
  })

  it('returns an error, if date set to an invalid value, and no valuesToSave', async () => {
    const requestBody = {
      'dateTime-day': '12',
      'dateTime-month': '',
      'dateTime-year': '2022',
      'dateTime-hour': '12',
      'dateTime-minute': '53',
    }
    const { errors, valuesToSave } = await validateRecallReceived({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'missingDateParts',
        href: '#dateTime-month',
        invalidParts: ['month'],
        name: 'dateTime',
        text: 'The date and time must include a month',
        values: {
          day: '12',
          hour: '12',
          minute: '53',
          month: '',
          year: '2022',
        },
      },
    ])
  })
})
