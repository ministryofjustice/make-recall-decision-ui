import { validateOffenceAnalysis } from './formValidator'

describe('validateOffenceAnalysis', () => {
  const recommendationId = '34'
  it('returns valuesToSave and no errors if valid', async () => {
    const requestBody = {
      offenceAnalysis: 'Re-offending<p></p>',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateOffenceAnalysis({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      offenceAnalysis: 'Re-offending',
    })
    expect(nextPagePath).toEqual('/recommendations/34/task-list#heading-person-details')
  })

  it('returns an error, if not set, and no valuesToSave', async () => {
    const requestBody = {
      offenceAnalysis: ' ', // whitespace
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateOffenceAnalysis({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#offenceAnalysis',
        name: 'offenceAnalysis',
        text: 'Enter the offence analysis',
        errorId: 'missingOffenceAnalysis',
      },
    ])
  })
})
