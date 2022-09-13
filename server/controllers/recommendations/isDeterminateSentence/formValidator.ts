import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { isValueValid } from '../helpers/formOptions'
import { strings } from '../../../textStrings/en'
import { nextPageLinkUrl } from '../helpers/urls'

export const validateIsDeterminateSentence = async ({
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
    const nextPageId = isDeterminateSentence === 'YES' ? 'recall-type' : 'indeterminate-type'
    nextPagePath = nextPageLinkUrl({ nextPageId, urlInfo })
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
