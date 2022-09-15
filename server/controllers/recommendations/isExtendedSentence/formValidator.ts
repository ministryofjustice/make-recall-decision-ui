import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { isValueValid } from '../helpers/formOptions'
import { strings } from '../../../textStrings/en'

export const validateIsExtendedSentence = async ({ requestBody, urlInfo }: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const { isExtendedSentence, isIndeterminateSentence } = requestBody
  if (!isExtendedSentence || !isValueValid(isExtendedSentence as string, 'isExtendedSentence')) {
    const errorId = 'noIsExtendedSelected'
    errors = [
      makeErrorObject({
        id: 'isExtendedSentence',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
  }
  if (!errors) {
    const isYes = isExtendedSentence === 'YES'
    valuesToSave = {
      isExtendedSentence: isYes,
    }
    let nextPageId = 'indeterminate-type'
    if (isIndeterminateSentence === '0') {
      nextPageId = isYes ? 'recall-type-indeterminate' : 'recall-type'
    }
    // ignore any 'fromPage' parameter, user should proceed through entire flow back to task list
    nextPagePath = `${urlInfo.basePath}${nextPageId}`
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
