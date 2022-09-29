import { DateTime } from 'luxon'
import { validateNextAppointment } from './formValidator'

describe('validateNextAppointment', () => {
  const recommendationId = '34'
  const urlInfo = {
    currentPageId: 'appointment-no-recall',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/appointment-no-recall`,
  }
  const { year } = DateTime.now().plus({ years: 1 })

  it('returns valuesToSave and no errors, and redirects to preview, if valid and other tasks complete', async () => {
    const requestBody = {
      howWillAppointmentHappen: 'VIDEO_CALL',
      'dateTimeOfAppointment-day': '12',
      'dateTimeOfAppointment-month': '05',
      'dateTimeOfAppointment-year': year.toString(),
      'dateTimeOfAppointment-hour': '12',
      'dateTimeOfAppointment-minute': '53',
      probationPhoneNumber: '01277345263',
      createLetterTasksComplete: '1',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateNextAppointment({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      nextAppointment: {
        dateTimeOfAppointment: `${year}-05-12T11:53:00.000Z`,
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
          selected: 'VIDEO_CALL',
        },
        probationPhoneNumber: '01277345263',
      },
    })
    expect(nextPagePath).toEqual('/recommendations/34/preview-no-recall')
  })

  it('redirects to task list, if valid and other tasks not complete', async () => {
    const requestBody = {
      howWillAppointmentHappen: 'VIDEO_CALL',
      'dateTimeOfAppointment-day': '12',
      'dateTimeOfAppointment-month': '05',
      'dateTimeOfAppointment-year': year.toString(),
      'dateTimeOfAppointment-hour': '12',
      'dateTimeOfAppointment-minute': '53',
      probationPhoneNumber: '01277345263',
      createLetterTasksComplete: '0',
      crn: 'X34534',
    }
    const { errors, nextPagePath } = await validateNextAppointment({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(nextPagePath).toEqual('/recommendations/34/task-list-no-recall#heading-create-letter')
  })

  it('if "from page" is set to no recall task list, redirect to it', async () => {
    const requestBody = {
      howWillAppointmentHappen: 'VIDEO_CALL',
      'dateTimeOfAppointment-day': '12',
      'dateTimeOfAppointment-month': '05',
      'dateTimeOfAppointment-year': year.toString(),
      'dateTimeOfAppointment-hour': '12',
      'dateTimeOfAppointment-minute': '53',
      probationPhoneNumber: '01277345263',
      crn: 'X34534',
    }
    const urlInfoWithFromPage = { ...urlInfo, fromPageId: 'task-list-no-recall', fromAnchor: 'heading-create-letter' }
    const { nextPagePath } = await validateNextAppointment({
      requestBody,
      urlInfo: urlInfoWithFromPage,
    })
    expect(nextPagePath).toEqual(`/recommendations/34/task-list-no-recall#heading-create-letter`)
  })

  it('returns errors, if not set, and no valuesToSave', async () => {
    const requestBody = {
      howWillAppointmentHappen: '',
      'dateTimeOfAppointment-day': '',
      'dateTimeOfAppointment-month': '',
      'dateTimeOfAppointment-year': '',
      'dateTimeOfAppointment-hour': '',
      'dateTimeOfAppointment-minute': '',
      probationPhoneNumber: ' ', // whitespace
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateNextAppointment({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'noAppointmentTypeSelected',
        href: '#howWillAppointmentHappen',
        name: 'howWillAppointmentHappen',
        text: 'You must select how the appointment will happen',
      },
      {
        errorId: 'blankDateTime',
        href: '#dateTimeOfAppointment-day',
        invalidParts: ['day', 'month', 'year', 'hour', 'minute'],
        name: 'dateTimeOfAppointment',
        text: 'Enter the date and time of the appointment',
        values: {
          day: '',
          hour: '',
          minute: '',
          month: '',
          year: '',
        },
      },
      {
        errorId: 'missingProbationPhoneNumber',
        href: '#probationPhoneNumber',
        name: 'probationPhoneNumber',
        text: 'You must give a telephone number for probation',
      },
    ])
  })

  it('returns an error, if date set to an invalid value, and no valuesToSave', async () => {
    const requestBody = {
      howWillAppointmentHappen: 'VIDEO_CALL',
      'dateTimeOfAppointment-day': '12',
      'dateTimeOfAppointment-month': '',
      'dateTimeOfAppointment-year': '2022',
      'dateTimeOfAppointment-hour': '12',
      'dateTimeOfAppointment-minute': '53',
      probationPhoneNumber: '01277345263',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateNextAppointment({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'missingDateParts',
        href: '#dateTimeOfAppointment-month',
        invalidParts: ['month'],
        name: 'dateTimeOfAppointment',
        text: 'The date and time of the appointment must include a month',
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

  it('returns an error, if phone number set to an invalid value, and no valuesToSave', async () => {
    const requestBody = {
      howWillAppointmentHappen: 'VIDEO_CALL',
      'dateTimeOfAppointment-day': '12',
      'dateTimeOfAppointment-month': '05',
      'dateTimeOfAppointment-year': year.toString(),
      'dateTimeOfAppointment-hour': '12',
      'dateTimeOfAppointment-minute': '53',
      probationPhoneNumber: '2343453',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateNextAppointment({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'invalidPhoneNumber',
        href: '#probationPhoneNumber',
        name: 'probationPhoneNumber',
        text: 'Enter a telephone number, like 01277 960 001, 07364 900 982 or +44 808 157 0192',
      },
    ])
  })
})
