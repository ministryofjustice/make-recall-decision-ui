import { validateExtendedIndeterminate } from './formValidator'

describe('validateExtendedIndeterminate', () => {
  const recommendationId = '34'
  const urlInfo = {
    currentPageId: 'extended-indeterminate',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/extended-indeterminate`,
  }

  it('returns valuesToSave and no errors if valid', async () => {
    const requestBody = {
      isExtendedOrIndeterminateSentence: 'YES',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateExtendedIndeterminate({
      requestBody,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      isExtendedOrIndeterminateSentence: true,
    })
    expect(nextPagePath).toEqual('/recommendations/34/recall-type')
  })

  it('returns an error, if not set, and no valuesToSave', async () => {
    const requestBody = {
      isExtendedOrIndeterminateSentence: '',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateExtendedIndeterminate({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#isExtendedOrIndeterminateSentence',
        name: 'isExtendedOrIndeterminateSentence',
        text: 'Select whether the person on probation is on an extended or indeterminate sentence or not',
        errorId: 'noExtendedIndeterminateSelected',
      },
    ])
  })

  it('returns an error, if set to an invalid value, and no valuesToSave', async () => {
    const requestBody = {
      isExtendedOrIndeterminateSentence: 'BANANA',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateExtendedIndeterminate({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#isExtendedOrIndeterminateSentence',
        name: 'isExtendedOrIndeterminateSentence',
        text: 'Select whether the person on probation is on an extended or indeterminate sentence or not',
        errorId: 'noExtendedIndeterminateSelected',
      },
    ])
  })

  it('if "from page" is set to recall task list, redirect to it', async () => {
    const requestBody = {
      isExtendedOrIndeterminateSentence: 'NO',
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
