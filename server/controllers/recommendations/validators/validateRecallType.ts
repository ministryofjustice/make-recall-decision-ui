import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { formOptions } from '../formOptions'
import { strings } from '../../../textStrings/en'

export const validateRecallType = ({ requestBody }: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const { recallType } = requestBody
  if (!recallType) {
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
    nextPagePath = `${routeUrls.cases}/${requestBody.crn}/overview`
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
