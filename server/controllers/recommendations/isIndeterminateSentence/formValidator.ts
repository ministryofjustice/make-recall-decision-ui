import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { isValueValid } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'

export const validateIsIndeterminateSentence = async ({
  requestBody,
  urlInfo,
}: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

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
        isExtendedSentence: null,
        recallType: null,
        indeterminateOrExtendedSentenceDetails: null,
        fixedTermAdditionalLicenceConditions: null,
      }
      if (changedToYes) {
        valuesToSave.indeterminateSentenceType = null
      }
    }

    // ignore any 'fromPage' parameter, user should proceed through entire flow back to task list
    nextPagePath = `${urlInfo.basePath}is-extended`
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
