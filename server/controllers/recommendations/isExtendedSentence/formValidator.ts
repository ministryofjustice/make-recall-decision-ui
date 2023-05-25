import { makeErrorObject } from '../../../utils/errors'
import { isValueValid } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const validateIsExtendedSentence = async ({ requestBody }: FormValidatorArgs): FormValidatorReturn => {
  const { isExtendedSentence, currentSavedValue } = requestBody

  const isNo = isExtendedSentence === 'NO'
  const isYes = isExtendedSentence === 'YES'
  const changedToNo = isNo && currentSavedValue === 'YES'
  const changedToYes = isYes && currentSavedValue === 'NO'

  if (!isExtendedSentence || !isValueValid(isExtendedSentence as string, 'yesNo')) {
    const errorId = 'noIsExtendedSelected'
    const errors = [
      makeErrorObject({
        id: 'isExtendedSentence',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
    return {
      errors,
    }
  }
  let valuesToSave

  if (changedToNo || changedToYes) {
    valuesToSave = {
      isExtendedSentence: isYes,
      indeterminateSentenceType: null,
      indeterminateOrExtendedSentenceDetails: null,
      recallType: null,
    }
  } else {
    valuesToSave = {
      isExtendedSentence: isYes,
    }
  }
  return { valuesToSave }
}
