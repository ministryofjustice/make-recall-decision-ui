import { validateRecallType } from './validateRecallType'

describe('validateRecallType', () => {
  const recommendationId = '456'

  it('returns valuesToSave and no errors if valid', () => {
    const requestBody = {
      recallType: 'FIXED_TERM',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = validateRecallType({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      recallType: {
        options: [
          {
            text: 'Fixed term recall',
            value: 'FIXED_TERM',
          },
          {
            text: 'Standard recall',
            value: 'STANDARD',
          },
          {
            text: 'No recall',
            value: 'NO_RECALL',
          },
        ],
        value: 'FIXED_TERM',
      },
    })
    expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/custody-status`)
  })

  it('returns an error for the decision, if not set, and no valuesToSave', () => {
    const requestBody = {
      recallType: '',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = validateRecallType({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#recallType',
        name: 'recallType',
        text: 'Select a recommendation',
        errorId: 'noRecallTypeSelected',
      },
    ])
  })

  it('returns an error, if set to an invalid value, and no valuesToSave', () => {
    const requestBody = {
      recallType: 'BANANA',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = validateRecallType({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#recallType',
        name: 'recallType',
        text: 'Select a recommendation',
        errorId: 'noRecallTypeSelected',
      },
    ])
  })
})
