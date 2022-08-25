import { validateEmergencyRecall } from './formValidator'

describe('validateEmergencyRecall', () => {
  const recommendationId = '34'
  it('returns valuesToSave and no errors if valid', async () => {
    const requestBody = {
      isThisAnEmergencyRecall: 'YES',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateEmergencyRecall({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      isThisAnEmergencyRecall: true,
    })
    expect(nextPagePath).toEqual('/recommendations/34/custody-status')
  })

  it('returns an error, if not set, and no valuesToSave', async () => {
    const requestBody = {
      isThisAnEmergencyRecall: '',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateEmergencyRecall({ requestBody, recommendationId })
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

  it('returns an error, if set to an invalid value, and no valuesToSave', async () => {
    const requestBody = {
      isThisAnEmergencyRecall: 'BANANA',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateEmergencyRecall({ requestBody, recommendationId })
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
