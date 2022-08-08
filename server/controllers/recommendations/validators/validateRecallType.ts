import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { formOptions, isValueValid } from '../formOptions'
import { strings } from '../../../textStrings/en'

export const validateRecallType = ({ requestBody, recommendationId }: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const { recallType } = requestBody
  if (!recallType || !isValueValid(recallType, 'recallType')) {
    const errorId = 'noRecallTypeSelected'
    errors = [
      makeErrorObject({
        id: 'recallType',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
  }
  if (!errors) {
    valuesToSave = {
      recallType: {
        value: recallType,
        options: formOptions.recallType,
      },
    }
    if (recallType === 'NO_RECALL') {
      nextPagePath = `${routeUrls.recommendations}/${recommendationId}/start-no-recall`
    } else {
      nextPagePath = `${routeUrls.recommendations}/${recommendationId}/custody-status`
    }
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
