import { makeErrorObject } from '../../../utils/errors'
import { isValueValid } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const validateIsIndeterminateSentence = async ({ requestBody }: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave

  const { isIndeterminateSentence, currentSavedValue } = requestBody
  if (!isIndeterminateSentence || !isValueValid(isIndeterminateSentence as string, 'yesNo')) {
    const errorId = 'noIsIndeterminateSelected'
    errors = [
      makeErrorObject({
        id: 'isIndeterminateSentence',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
  }
  if (!errors) {
    const isNo = isIndeterminateSentence === 'NO'
    const isYes = isIndeterminateSentence === 'YES'
    const changedToNo = isNo && currentSavedValue === 'YES'
    const changedToYes = isYes && currentSavedValue === 'NO'
    valuesToSave = {
      isIndeterminateSentence: isYes,
      indeterminateSentenceType: undefined,
    }
    if (isNo) {
      valuesToSave.indeterminateSentenceType = {
        selected: 'NO',
      }
    }
    if (changedToNo || changedToYes) {
      valuesToSave = {
        ...valuesToSave,
        recallType: null,
        indeterminateOrExtendedSentenceDetails: null,
        fixedTermAdditionalLicenceConditions: null,
        isThisAnEmergencyRecall: null,
      }
      if (changedToYes) {
        valuesToSave.indeterminateSentenceType = null
      }
    }
  }
  return {
    errors,
    valuesToSave,
  }
}
