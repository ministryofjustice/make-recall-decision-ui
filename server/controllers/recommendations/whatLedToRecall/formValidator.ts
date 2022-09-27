import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { strings } from '../../../textStrings/en'
import { isEmptyStringOrWhitespace } from '../../../utils/utils'

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
      whatLedToRecall,
    }
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/task-list#heading-circumstances`
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
