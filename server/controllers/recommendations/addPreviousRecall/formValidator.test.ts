import { validateAddPreviousRecall } from './formValidator'

describe('validateAddPreviousRecall', () => {
  const recommendationId = '34'
  it('returns valuesToSave and no errors if valid', async () => {
    const requestBody = {
      'previousRecallDate-day': '12',
      'previousRecallDate-month': '05',
      'previousRecallDate-year': '2022',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateAddPreviousRecall({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      previousRecalls: {
        previousRecallDates: ['2022-05-12'],
      },
    })
    expect(nextPagePath).toEqual('/recommendations/34/previous-recalls')
  })

  it('returns an error, if not set, and no valuesToSave', async () => {
    const requestBody = {
      'previousRecallDate-day': '',
      'previousRecallDate-month': '',
      'previousRecallDate-year': '',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateAddPreviousRecall({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'blankDateTime',
        href: '#previousRecallDate-day',
        name: 'previousRecallDate',
        text: 'Enter the previous recall date',
        values: {
          day: '',
          month: '',
          year: '',
        },
      },
    ])
  })

  it('returns an error, if set to an invalid value, and no valuesToSave', async () => {
    const requestBody = {
      'previousRecallDate-day': '12',
      'previousRecallDate-month': '',
      'previousRecallDate-year': '2022',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateAddPreviousRecall({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'missingDateParts',
        href: '#previousRecallDate-month',
        name: 'previousRecallDate',
        text: 'The previous recall date must include a month',
        values: {
          day: '12',
          month: '',
          year: '2022',
        },
      },
    ])
  })
})
