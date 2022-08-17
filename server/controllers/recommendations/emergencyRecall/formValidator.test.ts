import { validateEmergencyRecall } from './formValidator'

describe('validateEmergencyRecall', () => {
  const recommendationId = '34'
  it('returns valuesToSave and no errors if valid', () => {
    const requestBody = {
      isThisAnEmergencyRecall: 'YES',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = validateEmergencyRecall({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      isThisAnEmergencyRecall: true,
    })
    expect(nextPagePath).toEqual('/recommendations/34/custody-status')
  })

  it('returns an error, if not set, and no valuesToSave', () => {
    const requestBody = {
      isThisAnEmergencyRecall: '',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = validateEmergencyRecall({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#isThisAnEmergencyRecall',
        name: 'isThisAnEmergencyRecall',
        text: 'You must select whether this is an emergency recall or not',
        errorId: 'noEmergencyRecallSelected',
      },
    ])
  })

  it('returns an error, if set to an invalid value, and no valuesToSave', () => {
    const requestBody = {
      isThisAnEmergencyRecall: 'BANANA',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = validateEmergencyRecall({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#isThisAnEmergencyRecall',
        name: 'isThisAnEmergencyRecall',
        text: 'You must select whether this is an emergency recall or not',
        errorId: 'noEmergencyRecallSelected',
      },
    ])
  })
})
