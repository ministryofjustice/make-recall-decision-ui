import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { strings } from '../../../textStrings/en'

export const validateWhatLedToRecall = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const { whatLedToRecall } = requestBody
  if (!whatLedToRecall) {
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
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/task-list`
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
