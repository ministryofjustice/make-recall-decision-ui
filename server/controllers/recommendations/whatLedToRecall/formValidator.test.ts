import { validateWhatLedToRecall } from './formValidator'

describe('validateWhatLedToRecall', () => {
  const recommendationId = '34'
  it('returns valuesToSave and no errors if valid', async () => {
    const requestBody = {
      whatLedToRecall: 'Re-offending',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateWhatLedToRecall({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      whatLedToRecall: 'Re-offending',
    })
    expect(nextPagePath).toEqual('/recommendations/34/task-list')
  })

  it('returns an error, if not set, and no valuesToSave', async () => {
    const requestBody = {
      whatLedToRecall: '',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateWhatLedToRecall({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#whatLedToRecall',
        name: 'whatLedToRecall',
        text: 'You must explain what has led to this recall',
        errorId: 'missingWhatLedToRecall',
      },
    ])
  })
})
