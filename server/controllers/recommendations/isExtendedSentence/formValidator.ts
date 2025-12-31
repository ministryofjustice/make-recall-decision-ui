import { makeErrorObject } from '../../../utils/errors'
import { isValueValid } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'
import { YesNoValues } from '../formOptions/yesNo'

export const validateIsExtendedSentence = async ({ requestBody }: FormValidatorArgs): FormValidatorReturn => {
  const { isExtendedSentence, currentSavedValue } = requestBody

  const isNo = isExtendedSentence === YesNoValues.NO
  const isYes = isExtendedSentence === YesNoValues.YES
  const changedToNo = isNo && currentSavedValue === YesNoValues.YES
  const changedToYes = isYes && currentSavedValue === YesNoValues.NO

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
