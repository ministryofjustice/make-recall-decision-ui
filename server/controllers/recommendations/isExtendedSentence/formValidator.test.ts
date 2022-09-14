import { validateIsExtendedSentence } from './formValidator'

describe('validateIsExtendedSentence', () => {
  const recommendationId = '34'
  const urlInfo = {
    currentPageId: 'is-indeterminate',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/is-indeterminate`,
  }

  it('redirects to indeterminate sentence type page if it is an indeterminate sentence', async () => {
    const requestBody = {
      isExtendedSentence: 'NO',
      isIndeterminateSentence: '1',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateIsExtendedSentence({
      requestBody,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      isExtendedSentence: false,
    })
    expect(nextPagePath).toEqual('/recommendations/34/indeterminate-type')
  })

  it('redirects to recall type page if it is not an indeterminate sentence', async () => {
    const requestBody = {
      isExtendedSentence: 'YES',
      isIndeterminateSentence: '0',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateIsExtendedSentence({
      requestBody,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      isExtendedSentence: true,
    })
    expect(nextPagePath).toEqual('/recommendations/34/recall-type')
  })

  it('returns an error, if not set, and no valuesToSave', async () => {
    const requestBody = {
      isExtendedSentence: '',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateIsExtendedSentence({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#isExtendedSentence',
        name: 'isExtendedSentence',
        text: 'Select whether the person on probation is on an indeterminate sentence or not',
        errorId: 'noIsIndeterminateSelected',
      },
    ])
  })

  it('returns an error, if set to an invalid value, and no valuesToSave', async () => {
    const requestBody = {
      isExtendedSentence: 'BANANA',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateIsExtendedSentence({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#isExtendedSentence',
        name: 'isExtendedSentence',
        text: 'Select whether the person on probation is on an indeterminate sentence or not',
        errorId: 'noIsIndeterminateSelected',
      },
    ])
  })

  it('if "from page" is set to recall task list, redirect to it', async () => {
    const requestBody = {
      isExtendedSentence: 'NO',
      crn: 'X34534',
    }
    const urlInfoWithFromPage = { ...urlInfo, fromPageId: 'task-list', fromAnchor: 'heading-circumstances' }
    const { nextPagePath } = await validateIsExtendedSentence({
      requestBody,
      recommendationId,
      urlInfo: urlInfoWithFromPage,
    })
    expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list#heading-circumstances`)
  })
})
