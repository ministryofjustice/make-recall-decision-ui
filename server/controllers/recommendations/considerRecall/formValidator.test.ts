import { validateConsiderRecall } from './formValidator'

describe('validateConsiderRecall', () => {
  const recommendationId = '34'
  it('returns valuesToSave and no errors if valid', async () => {
    const requestBody = {
      recallConsideredDetail: 'Re-offending<p></p>',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateConsiderRecall({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      crn: 'X34534',
      recallConsideredDetail: 'Re-offending',
    })
    expect(nextPagePath).toEqual('/cases/X34534/overview')
  })

  it('returns an error, if not set, and no valuesToSave', async () => {
    const requestBody = {
      recallConsideredDetail: ' ', // whitespace
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateConsiderRecall({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#recallConsideredDetail',
        name: 'recallConsideredDetail',
        text: "Enter details about why you're considering a recall",
        errorId: 'missingRecallConsideredDetail',
      },
    ])
  })
})
