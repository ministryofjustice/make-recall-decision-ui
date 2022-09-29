import { validateVictimContactScheme } from './formValidator'
import { formOptions } from '../formOptions/formOptions'

describe('validateVictimContactScheme', () => {
  const recommendationId = '34'
  it('returns valuesToSave and no errors if valid', async () => {
    const requestBody = {
      hasVictimsInContactScheme: 'YES',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateVictimContactScheme({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      hasVictimsInContactScheme: {
        allOptions: formOptions.hasVictimsInContactScheme,
        selected: 'YES',
      },
    })
    expect(nextPagePath).toEqual('/recommendations/34/victim-liaison-officer')
  })

  it('sets VLO date to blank value and redirects to arrest issues if No selected', async () => {
    const requestBody = {
      hasVictimsInContactScheme: 'NO',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateVictimContactScheme({ requestBody, recommendationId })
    expect(valuesToSave).toEqual({
      hasVictimsInContactScheme: {
        allOptions: formOptions.hasVictimsInContactScheme,
        selected: 'NO',
      },
      dateVloInformed: null,
    })
    expect(errors).toBeUndefined()
    expect(nextPagePath).toEqual('/recommendations/34/task-list#heading-victim-liaison')
  })

  it('redirects to task list if Not applicable selected', async () => {
    const requestBody = {
      hasVictimsInContactScheme: 'NOT_APPLICABLE',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateVictimContactScheme({ requestBody, recommendationId })
    expect(valuesToSave).toEqual({
      hasVictimsInContactScheme: {
        allOptions: formOptions.hasVictimsInContactScheme,
        selected: 'NOT_APPLICABLE',
      },
      dateVloInformed: null,
    })
    expect(errors).toBeUndefined()
    expect(nextPagePath).toEqual('/recommendations/34/task-list#heading-victim-liaison')
  })

  it('returns an error, if not set, and no valuesToSave', async () => {
    const requestBody = {
      hasVictimsInContactScheme: '',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateVictimContactScheme({ requestBody, recommendationId })
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

  it('returns an error, if set to an invalid value, and no valuesToSave', async () => {
    const requestBody = {
      hasVictimsInContactScheme: 'BANANA',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateVictimContactScheme({ requestBody, recommendationId })
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
