import { validateExtendedIndeterminate } from './formValidator'

describe('validateExtendedIndeterminate', () => {
  const recommendationId = '34'
  const urlInfo = {
    currentPageId: 'is-determinate',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/is-determinate`,
  }

  it('returns valuesToSave and no errors if valid', async () => {
    const requestBody = {
      isDeterminateSentence: 'YES',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateExtendedIndeterminate({
      requestBody,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      isDeterminateSentence: true,
    })
    expect(nextPagePath).toEqual('/recommendations/34/recall-type')
  })

  it('returns an error, if not set, and no valuesToSave', async () => {
    const requestBody = {
      isDeterminateSentence: '',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateExtendedIndeterminate({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#isDeterminateSentence',
        name: 'isDeterminateSentence',
        text: 'Select whether the person on probation is on a determinate sentence or not',
        errorId: 'noDeterminateSelected',
      },
    ])
  })

  it('returns an error, if set to an invalid value, and no valuesToSave', async () => {
    const requestBody = {
      isDeterminateSentence: 'BANANA',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateExtendedIndeterminate({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#isDeterminateSentence',
        name: 'isDeterminateSentence',
        text: 'Select whether the person on probation is on a determinate sentence or not',
        errorId: 'noDeterminateSelected',
      },
    ])
  })

  it('if "from page" is set to recall task list, redirect to it', async () => {
    const requestBody = {
      isDeterminateSentence: 'NO',
      crn: 'X34534',
    }
    const urlInfoWithFromPage = { ...urlInfo, fromPageId: 'task-list', fromAnchor: 'heading-circumstances' }
    const { nextPagePath } = await validateExtendedIndeterminate({
      requestBody,
      recommendationId,
      urlInfo: urlInfoWithFromPage,
    })
    expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list#heading-circumstances`)
  })
})
