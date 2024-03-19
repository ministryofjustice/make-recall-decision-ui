import { validateDateTime } from './formValidator'

describe('validateDateTime', () => {
  const recommendationId = '34'
  const urlInfo = {
    currentPageId: 'appointment-no-recall',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/appointment-no-recall`,
  }

  it('returns valuesToSave and no errors, and redirects to preview, if valid and other tasks complete', async () => {
    const requestBody = {
      'dateTime-day': '12',
      'dateTime-month': '01',
      'dateTime-year': '2024',
      'dateTime-hour': '11',
      'dateTime-minute': '53',
    }
    const { errors, valuesToSave } = await validateDateTime({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      decisionDateTime: '2024-01-12T11:53:00.000Z',
    })
  })
  it('returns errors for an invalid date and time value - missing date parts', async () => {
    const requestBody = {
      'dateTime-day': '',
      'dateTime-month': '01',
      'dateTime-year': '',
      'dateTime-hour': '11',
      'dateTime-minute': '53',
    }
    const { errors } = await validateDateTime({ requestBody, urlInfo })
    expect(errors).toBeDefined()
    expect(errors).toEqual([
      {
        errorId: 'missingDateParts',
        href: '#dateTime-day',
        invalidParts: ['day', 'year'],
        name: 'dateTime',
        text: 'The date the SPO agreed the recall must include a day and year',
        values: {
          day: '',
          hour: '11',
          minute: '53',
          month: '01',
          year: '',
        },
      },
    ])
  })
  it('returns errors for an invalid date and time value - missing time parts', async () => {
    const requestBody = {
      'dateTime-day': '12',
      'dateTime-month': '01',
      'dateTime-year': '2024',
      'dateTime-hour': '',
      'dateTime-minute': '',
    }
    const { errors } = await validateDateTime({ requestBody, urlInfo })
    expect(errors).toBeDefined()
    expect(errors).toEqual([
      {
        errorId: 'missingTime',
        href: '#dateTime-hour',
        invalidParts: ['hour', 'minute'],
        name: 'dateTime',
        text: 'The date the SPO agreed the recall must include a time',
        values: {
          day: '12',
          hour: '',
          minute: '',
          month: '01',
          year: '2024',
        },
      },
    ])
  })
})
