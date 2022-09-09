import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { isValueValid } from '../helpers/formOptions'
import { strings } from '../../../textStrings/en'
import { nextPageLinkUrl } from '../helpers/urls'

export const validateExtendedIndeterminate = async ({
  requestBody,
  urlInfo,
}: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const { isExtendedOrIndeterminateSentence } = requestBody
  if (
    !isExtendedOrIndeterminateSentence ||
    !isValueValid(isExtendedOrIndeterminateSentence as string, 'isExtendedOrIndeterminateSentence')
  ) {
    const errorId = 'noExtendedIndeterminateSelected'
    errors = [
      makeErrorObject({
        id: 'isExtendedOrIndeterminateSentence',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
  }
  if (!errors) {
    valuesToSave = {
      isExtendedOrIndeterminateSentence: isExtendedOrIndeterminateSentence === 'YES',
    }
    nextPagePath = nextPageLinkUrl({ nextPageId: 'recall-type', urlInfo })
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
