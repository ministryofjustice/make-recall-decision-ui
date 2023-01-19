import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { strings } from '../../../textStrings/en'
import { isEmptyStringOrWhitespace, stripHtmlTags } from '../../../utils/utils'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const validateWhatLedToRecall = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const { whatLedToRecall } = requestBody
  if (isEmptyStringOrWhitespace(whatLedToRecall)) {
    const errorId = 'missingWhatLedToRecall'
    errors = [
      makeErrorObject({
        id: 'whatLedToRecall',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
  }
  if (!errors) {
    valuesToSave = {
      whatLedToRecall: stripHtmlTags(whatLedToRecall as string),
    }
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/task-list#heading-circumstances`
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
