import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { isValueValid } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'

export const validateIsExtendedSentence = async ({ requestBody, urlInfo }: FormValidatorArgs): FormValidatorReturn => {
  const { isExtendedSentence, isIndeterminateSentence, currentSavedValue } = requestBody

  const isNo = isExtendedSentence === 'NO'
  const isYes = isExtendedSentence === 'YES'
  const changedToNo = isNo && currentSavedValue === 'YES'
  const changedToYes = isYes && currentSavedValue === 'NO'
  const isDeterminateSentence = isIndeterminateSentence === '0'

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

  if (isDeterminateSentence && (changedToNo || changedToYes)) {
    valuesToSave = {
      isExtendedSentence: isYes,
      recallType: null,
    }
  } else {
    valuesToSave = {
      isExtendedSentence: isYes,
    }
  }
  let nextPageId = 'indeterminate-type'
  if (isDeterminateSentence) {
    nextPageId = isYes ? 'recall-type-indeterminate' : 'recall-type'
  }
  // ignore any 'fromPage' parameter, user should proceed through entire flow back to task list
  const nextPagePath = `${urlInfo.basePath}${nextPageId}`

  return {
    valuesToSave,
    nextPagePath,
  }
}
