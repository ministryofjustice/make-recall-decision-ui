import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { isValueValid } from '../helpers/formOptions'
import { strings } from '../../../textStrings/en'

export const validateEmergencyRecall = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const { isThisAnEmergencyRecall } = requestBody
  if (!isThisAnEmergencyRecall || !isValueValid(isThisAnEmergencyRecall as string, 'isThisAnEmergencyRecall')) {
    const errorId = 'noEmergencyRecallSelected'
    errors = [
      makeErrorObject({
        id: 'isThisAnEmergencyRecall',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
  }
  if (!errors) {
    valuesToSave = {
      isThisAnEmergencyRecall: isThisAnEmergencyRecall === 'YES',
    }
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/custody-status`
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
