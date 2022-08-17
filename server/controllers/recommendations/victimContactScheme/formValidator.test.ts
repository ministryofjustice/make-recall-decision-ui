import { validateVictimContactScheme } from './formValidator'
import { formOptions } from '../helpers/formOptions'

describe('validateVictimContactScheme', () => {
  const recommendationId = '34'
  it('returns valuesToSave and no errors if valid', () => {
    const requestBody = {
      hasVictimsInContactScheme: 'YES',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = validateVictimContactScheme({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      hasVictimsInContactScheme: {
        allOptions: formOptions.hasVictimsInContactScheme,
        selected: 'YES',
      },
    })
    expect(nextPagePath).toEqual('/recommendations/34/victim-liaison-officer')
  })

  it('sets VLO date to blank value and redirects to arrest issues if No selected', () => {
    const requestBody = {
      hasVictimsInContactScheme: 'NO',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = validateVictimContactScheme({ requestBody, recommendationId })
    expect(valuesToSave).toEqual({
      hasVictimsInContactScheme: {
        allOptions: formOptions.hasVictimsInContactScheme,
        selected: 'NO',
      },
      dateVloInformed: null,
    })
    expect(errors).toBeUndefined()
    expect(nextPagePath).toEqual('/recommendations/34/arrest-issues')
  })

  it('redirects to arrest issues page if Not applicable selected', () => {
    const requestBody = {
      hasVictimsInContactScheme: 'NOT_APPLICABLE',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = validateVictimContactScheme({ requestBody, recommendationId })
    expect(valuesToSave).toEqual({
      hasVictimsInContactScheme: {
        allOptions: formOptions.hasVictimsInContactScheme,
        selected: 'NOT_APPLICABLE',
      },
      dateVloInformed: null,
    })
    expect(errors).toBeUndefined()
    expect(nextPagePath).toEqual('/recommendations/34/arrest-issues')
  })

  it('returns an error, if not set, and no valuesToSave', () => {
    const requestBody = {
      hasVictimsInContactScheme: '',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = validateVictimContactScheme({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#hasVictimsInContactScheme',
        name: 'hasVictimsInContactScheme',
        text: 'You must select whether there are any victims in the victim contact scheme',
        errorId: 'noVictimContactSchemeSelected',
      },
    ])
  })

  it('returns an error, if set to an invalid value, and no valuesToSave', () => {
    const requestBody = {
      hasVictimsInContactScheme: 'BANANA',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = validateVictimContactScheme({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#hasVictimsInContactScheme',
        name: 'hasVictimsInContactScheme',
        text: 'You must select whether there are any victims in the victim contact scheme',
        errorId: 'noVictimContactSchemeSelected',
      },
    ])
  })
})
