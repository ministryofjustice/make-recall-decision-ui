import { validateCustodyStatus } from './validateCustodyStatus'

describe('validateCustodyStatus', () => {
  const recommendationId = '34'
  it('returns valuesToSave and no errors if valid', () => {
    const requestBody = {
      custodyStatus: 'YES_POLICE',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = validateCustodyStatus({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      custodyStatus: {
        options: [
          { value: 'YES_PRISON', text: 'Yes, prison custody' },
          { value: 'YES_POLICE', text: 'Yes, police custody' },
          { value: 'NO', text: 'No' },
        ],
        value: 'YES_POLICE',
      },
    })
    expect(nextPagePath).toEqual('/recommendations/34/confirmation-part-a')
  })

  it('returns an error, if not set, and no valuesToSave', () => {
    const requestBody = {
      custodyStatus: '',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = validateCustodyStatus({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#custodyStatus',
        name: 'custodyStatus',
        text: 'Select an option',
        errorId: 'noCustodyStatusSelected',
      },
    ])
  })

  it('returns an error, if set to an invalid value, and no valuesToSave', () => {
    const requestBody = {
      custodyStatus: 'BANANA',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = validateCustodyStatus({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#custodyStatus',
        name: 'custodyStatus',
        text: 'Select an option',
        errorId: 'noCustodyStatusSelected',
      },
    ])
  })
})
