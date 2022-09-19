import { validateIsIndeterminateSentence } from './formValidator'

describe('validateIsIndeterminateSentence', () => {
  const recommendationId = '34'
  const urlInfo = {
    currentPageId: 'is-indeterminate',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/is-indeterminate`,
  }

  it('if No selected, sets indeterminateSentenceType, saves value and redirects', async () => {
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
    })
    expect(nextPagePath).toEqual('/recommendations/34/is-extended')
  })

  it('if Yes selected, saves value and redirects', async () => {
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
    })
    expect(nextPagePath).toEqual('/recommendations/34/is-extended')
  })

  it('if answer changes from Yes to No, resets isExtendedSentence / indeterminateSentenceType / recallType / indeterminateOrExtendedSentenceDetails / fixedTermAdditionalLicenceConditions', async () => {
    const requestBody = {
      isIndeterminateSentence: 'NO',
      currentSavedValue: 'YES',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateIsIndeterminateSentence({
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
      indeterminateOrExtendedSentenceDetails: null,
      fixedTermAdditionalLicenceConditions: null,
    })
  })

  it('if answer changes from No to Yes, resets isExtendedSentence / indeterminateSentenceType / recallType / indeterminateOrExtendedSentenceDetails / fixedTermAdditionalLicenceConditions', async () => {
    const requestBody = {
      isIndeterminateSentence: 'YES',
      currentSavedValue: 'NO',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateIsIndeterminateSentence({
      requestBody,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      isIndeterminateSentence: true,
      indeterminateSentenceType: null,
      isExtendedSentence: null,
      recallType: null,
      indeterminateOrExtendedSentenceDetails: null,
      fixedTermAdditionalLicenceConditions: null,
    })
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

  it('if "from page" is set, ignore it', async () => {
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
    expect(nextPagePath).toEqual('/recommendations/34/is-extended')
  })
})
