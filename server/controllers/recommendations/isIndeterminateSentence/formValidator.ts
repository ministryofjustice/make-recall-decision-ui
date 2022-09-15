import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { isValueValid } from '../helpers/formOptions'
import { strings } from '../../../textStrings/en'

export const validateIsIndeterminateSentence = async ({
  requestBody,
  urlInfo,
}: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const { isIndeterminateSentence } = requestBody
  if (!isIndeterminateSentence || !isValueValid(isIndeterminateSentence as string, 'isIndeterminateSentence')) {
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
    valuesToSave = {
      isIndeterminateSentence: isYes,
      isExtendedSentence: null,
      indeterminateSentenceType: isNo
        ? {
            selected: 'NO',
          }
        : null,
      recallType: null,
      // TODO - reset fixed term recall licence conditions, and indeterminate / extended details
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
