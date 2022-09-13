import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { formOptions, isValueValid } from '../helpers/formOptions'
import { strings } from '../../../textStrings/en'
import { nextPageLinkUrl } from '../helpers/urls'

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
    }
    const nextPageId = isYes ? 'indeterminate-type' : 'recall-type'
    nextPagePath = nextPageLinkUrl({ nextPageId, urlInfo })
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
