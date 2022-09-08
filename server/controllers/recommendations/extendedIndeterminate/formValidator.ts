import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { isValueValid } from '../helpers/formOptions'
import { strings } from '../../../textStrings/en'

export const validateExtendedIndeterminate = async ({
  requestBody,
  recommendationId,
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
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/recall-type`
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
