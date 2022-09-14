import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { isValueValid } from '../helpers/formOptions'
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
    nextPagePath = nextPageLinkUrl({ nextPageId: 'is-extended', urlInfo })
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
