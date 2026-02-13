import { validateIsIndeterminateSentence } from './formValidator'
import { YesNoValues } from '../formOptions/yesNo'

describe('validateIsIndeterminateSentence', () => {
  const recommendationId = '34'
  const urlInfo = {
    currentPageId: 'is-indeterminate',
    basePath: `/recommendations/${recommendationId}/`,
    path: `/recommendations/${recommendationId}/is-indeterminate`,
  }

  it('if No selected, sets indeterminateSentenceType, saves value and redirects', async () => {
    const requestBody = {
      isIndeterminateSentence: YesNoValues.NO,
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
        selected: YesNoValues.NO,
      },
    })
  })

  it('if Yes selected, saves value and redirects', async () => {
    const requestBody = {
      isIndeterminateSentence: YesNoValues.YES,
      crn: 'X34534',
    }
    const { errors, valuesToSave } = await validateIsIndeterminateSentence({
      requestBody,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      isIndeterminateSentence: true,
    })
  })

  it('if answer changes from Yes to No, resets isExtendedSentence / indeterminateSentenceType / recallType / indeterminateOrExtendedSentenceDetails / fixedTermAdditionalLicenceConditions', async () => {
    const requestBody = {
      isIndeterminateSentence: YesNoValues.NO,
      currentSavedValue: YesNoValues.YES,
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
        selected: YesNoValues.NO,
      },
      recallType: null,
      indeterminateOrExtendedSentenceDetails: null,
      fixedTermAdditionalLicenceConditions: null,
      isThisAnEmergencyRecall: null,
    })
  })

  it('if answer changes from No to Yes, resets isExtendedSentence / indeterminateSentenceType / recallType / indeterminateOrExtendedSentenceDetails / fixedTermAdditionalLicenceConditions', async () => {
    const requestBody = {
      isIndeterminateSentence: YesNoValues.YES,
      currentSavedValue: YesNoValues.NO,
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
      recallType: null,
      indeterminateOrExtendedSentenceDetails: null,
      fixedTermAdditionalLicenceConditions: null,
      isThisAnEmergencyRecall: null,
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
      isIndeterminateSentence: 'VALUE',
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
})
