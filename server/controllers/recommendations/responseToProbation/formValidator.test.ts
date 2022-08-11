import { validateResponseToProbation } from './formValidator'

describe('validateResponseToProbation', () => {
  const recommendationId = '34'
  it('returns valuesToSave and no errors if valid', () => {
    const requestBody = {
      responseToProbation: 'Re-offending',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = validateResponseToProbation({ requestBody, recommendationId })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      responseToProbation: 'Re-offending',
    })
    expect(nextPagePath).toEqual('/recommendations/34/recall-type')
  })

  it('returns an error, if not set, and no valuesToSave', () => {
    const requestBody = {
      responseToProbation: '',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = validateResponseToProbation({ requestBody, recommendationId })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#responseToProbation',
        name: 'responseToProbation',
        text: 'You must explain how Paula Smith has responded to probation',
        errorId: 'missingResponseToProbation',
      },
    ])
  })
})
