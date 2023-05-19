import { validateResponseToProbation } from './formValidator'

describe('validateResponseToProbation', () => {
  const recommendationId = '34'
  const urlInfo = {
    currentPageId: 'response-to-probation',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/response-to-probation`,
  }

  it('returns valuesToSave and no errors if valid', async () => {
    const requestBody = {
      responseToProbation: 'Re-offending',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateResponseToProbation({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      responseToProbation: 'Re-offending',
    })
    expect(nextPagePath).toEqual('/recommendations/34/licence-conditions')
  })

  it('returns an error, if not set, and no valuesToSave', async () => {
    const requestBody = {
      responseToProbation: ' ', // whitespace
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateResponseToProbation({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#responseToProbation',
        name: 'responseToProbation',
        text: 'You must explain how {{ fullName }} has responded to probation',
        errorId: 'missingResponseToProbation',
      },
    ])
  })

  it('if "from page" is set to recall task list, redirect to it', async () => {
    const requestBody = {
      responseToProbation: 'Re-offending',
      crn: 'X34534',
    }
    const urlInfoWithFromPage = { ...urlInfo, fromPageId: 'task-list', fromAnchor: 'heading-circumstances' }
    const { nextPagePath } = await validateResponseToProbation({
      requestBody,
      recommendationId,
      urlInfo: urlInfoWithFromPage,
    })
    expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list#heading-circumstances`)
  })

  it('strip out HTML tags from the input', async () => {
    const requestBody = {
      responseToProbation: 'Re-off<script>alert("")</script>ending',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateResponseToProbation({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      responseToProbation: 'Re-offalert("")ending',
    })
    expect(nextPagePath).toEqual('/recommendations/34/licence-conditions')
  })
})
