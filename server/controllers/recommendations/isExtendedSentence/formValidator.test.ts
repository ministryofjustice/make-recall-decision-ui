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
    const { errors, valuesToSave } = await validateIsExtendedSentence({
      requestBody,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      isExtendedSentence: false,
    })
  })

  it('redirects to recall type page if it is not an indeterminate sentence', async () => {
    const requestBody = {
      isExtendedSentence: 'YES',
      isIndeterminateSentence: '0',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateIsExtendedSentence({
      requestBody,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      isExtendedSentence: true,
    })
  })

  it('for determinate sentence, if answer changes from Yes to No, reset recallType', async () => {
    const requestBody = {
      isExtendedSentence: 'NO',
      isIndeterminateSentence: '0',
      currentSavedValue: 'YES',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateIsExtendedSentence({
      requestBody,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      isExtendedSentence: false,
      recallType: null,
      indeterminateSentenceType: null,
      indeterminateOrExtendedSentenceDetails: null,
    })
  })

  it('for determinate sentence, if answer changes from No to Yes, reset recallType', async () => {
    const requestBody = {
      isExtendedSentence: 'YES',
      isIndeterminateSentence: '0',
      currentSavedValue: 'NO',
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateIsExtendedSentence({
      requestBody,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      isExtendedSentence: true,
      recallType: null,
      indeterminateSentenceType: null,
      indeterminateOrExtendedSentenceDetails: null,
    })
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
        text: 'Select whether {{ fullName }} is on an extended sentence or not',
        errorId: 'noIsExtendedSelected',
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
        text: 'Select whether {{ fullName }} is on an extended sentence or not',
        errorId: 'noIsExtendedSelected',
      },
    ])
  })
})
