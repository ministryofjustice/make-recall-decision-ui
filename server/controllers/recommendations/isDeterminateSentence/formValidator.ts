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

  const { isDeterminateSentence } = requestBody
  if (!isDeterminateSentence || !isValueValid(isDeterminateSentence as string, 'isDeterminateSentence')) {
    const errorId = 'noDeterminateSelected'
    errors = [
      makeErrorObject({
        id: 'isDeterminateSentence',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
  }
  if (!errors) {
    valuesToSave = {
      isDeterminateSentence: isDeterminateSentence === 'YES',
    }
    nextPagePath = nextPageLinkUrl({ nextPageId: 'recall-type', urlInfo })
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
