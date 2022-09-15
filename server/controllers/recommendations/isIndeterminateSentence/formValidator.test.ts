import { validateIsIndeterminateSentence } from './formValidator'

describe('validateIsIndeterminateSentence', () => {
  const recommendationId = '34'
  const urlInfo = {
    currentPageId: 'is-indeterminate',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/is-indeterminate`,
  }

  it('sets indeterminate type to NO, extended sentence / recall type to null and redirects if answer is No', async () => {
    const requestBody = {
      isIndeterminateSentence: 'NO',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateIsIndeterminateSentence({
      requestBody,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      isIndeterminateSentence: false,
      indeterminateSentenceType: {
        selected: 'NO',
      },
      isExtendedSentence: null,
      recallType: null,
    })
    expect(nextPagePath).toEqual('/recommendations/34/is-extended')
  })

  it('resets indeterminate type to null, extended sentence to null and redirects, if answer is Yes', async () => {
    const requestBody = {
      isIndeterminateSentence: 'YES',
      crn: 'X34534',
    }
    const { errors, valuesToSave, nextPagePath } = await validateIsIndeterminateSentence({
      requestBody,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      isIndeterminateSentence: true,
      indeterminateSentenceType: null,
      isExtendedSentence: null,
      recallType: null,
    })
    expect(nextPagePath).toEqual('/recommendations/34/is-extended')
  })

  it('returns an error, if not set, and no valuesToSave', async () => {
    const requestBody = {
      isIndeterminateSentence: '',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateIsIndeterminateSentence({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#isIndeterminateSentence',
        name: 'isIndeterminateSentence',
        text: 'Select whether {{ fullName }} is on an indeterminate sentence or not',
        errorId: 'noIsIndeterminateSelected',
      },
    ])
  })

  it('returns an error, if set to an invalid value, and no valuesToSave', async () => {
    const requestBody = {
      isIndeterminateSentence: 'BANANA',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateIsIndeterminateSentence({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#isIndeterminateSentence',
        name: 'isIndeterminateSentence',
        text: 'Select whether {{ fullName }} is on an indeterminate sentence or not',
        errorId: 'noIsIndeterminateSelected',
      },
    ])
  })

  it('if "from page" is set to recall task list, redirect to it', async () => {
    const requestBody = {
      isIndeterminateSentence: 'NO',
      crn: 'X34534',
    }
    const urlInfoWithFromPage = { ...urlInfo, fromPageId: 'task-list', fromAnchor: 'heading-circumstances' }
    const { nextPagePath } = await validateIsIndeterminateSentence({
      requestBody,
      recommendationId,
      urlInfo: urlInfoWithFromPage,
    })
    expect(nextPagePath).toEqual(`/recommendations/${recommendationId}/task-list#heading-circumstances`)
  })
})
