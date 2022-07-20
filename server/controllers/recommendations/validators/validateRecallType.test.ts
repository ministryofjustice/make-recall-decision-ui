import { validateRecallType } from './validateRecallType'

describe('validateRecallType', () => {
  it('returns valuesToSave and no errors if valid', () => {
    const requestBody = {
      recallType: 'FIXED',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = validateRecallType({ requestBody })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      recallType: {
        options: [
          {
            text: 'Fixed term',
            value: 'FIXED_TERM',
          },
          {
            text: 'Standard',
            value: 'STANDARD',
          },
          {
            text: 'No recall',
            value: 'NO_RECALL',
          },
        ],
        value: 'FIXED',
      },
    })
    expect(nextPagePath).toEqual('/cases/X34534/overview')
  })

  it('returns an error for the decision, if not set, and no valuesToSave', () => {
    const requestBody = {
      recallType: '',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = validateRecallType({ requestBody })
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
