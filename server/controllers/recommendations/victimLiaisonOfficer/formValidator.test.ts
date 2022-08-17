import { validateVictimLiaisonOfficer } from './formValidator'

describe('validateVictimLiaisonOfficer', () => {
  const recommendationId = '34'
  it('returns valuesToSave and no errors if valid', () => {
    const requestBody = {
      'dateVloInformed-day': '12',
      'dateVloInformed-month': '05',
      'dateVloInformed-year': '2022',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = validateVictimLiaisonOfficer({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      dateVloInformed: '2022-05-12',
    })
    expect(nextPagePath).toEqual('/recommendations/34/arrest-issues')
  })

  it('returns an error, if not set, and no valuesToSave', () => {
    const requestBody = {
      'dateVloInformed-day': '',
      'dateVloInformed-month': '',
      'dateVloInformed-year': '',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = validateVictimLiaisonOfficer({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'blankDateTime',
        href: '#dateVloInformed-day',
        name: 'dateVloInformed',
        text: 'Enter the date you told the VLO',
        values: {
          day: '',
          month: '',
          year: '',
        },
      },
    ])
  })

  it('returns an error, if set to an invalid value, and no valuesToSave', () => {
    const requestBody = {
      'dateVloInformed-day': '12',
      'dateVloInformed-month': '',
      'dateVloInformed-year': '2022',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = validateVictimLiaisonOfficer({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        errorId: 'missingDateParts',
        href: '#dateVloInformed-month',
        name: 'dateVloInformed',
        text: 'The date you told the VLO must include a month',
        values: {
          day: '12',
          month: '',
          year: '2022',
        },
      },
    ])
  })
})
