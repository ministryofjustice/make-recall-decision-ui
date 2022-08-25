import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { formOptions, isValueValid } from '../helpers/formOptions'
import { strings } from '../../../textStrings/en'

export const validateCustodyStatus = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const { custodyStatus } = requestBody
  if (!custodyStatus || !isValueValid(custodyStatus as string, 'custodyStatus')) {
    const errorId = 'noCustodyStatusSelected'
    errors = [
      makeErrorObject({
        id: 'custodyStatus',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
  }
  if (!errors) {
    valuesToSave = {
      custodyStatus: {
        selected: custodyStatus,
        allOptions: formOptions.custodyStatus,
      },
    }
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/iom`
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
