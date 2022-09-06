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

  const { custodyStatus, custodyStatusDetailsYesPolice } = requestBody
  const invalidStatus = !custodyStatus || !isValueValid(custodyStatus as string, 'custodyStatus')
  const missingPoliceCustodyAddress = custodyStatus === 'YES_POLICE' && !custodyStatusDetailsYesPolice
  if (invalidStatus || missingPoliceCustodyAddress) {
    errors = []
    if (invalidStatus) {
      const errorId = 'noCustodyStatusSelected'
      errors.push(
        makeErrorObject({
          id: 'custodyStatus',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
    if (missingPoliceCustodyAddress) {
      const errorId = 'missingCustodyPoliceAddressDetail'
      errors.push(
        makeErrorObject({
          id: 'custodyStatusDetailsYesPolice',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
    return {
      errors,
      unsavedValues: {
        custodyStatus,
      },
    }
  }
  const valuesToSave = {
    custodyStatus: {
      selected: custodyStatus,
      details: custodyStatus === 'YES_POLICE' ? custodyStatusDetailsYesPolice : null,
      allOptions: formOptions.custodyStatus,
    },
  }
  const nextPagePath = `${routeUrls.recommendations}/${recommendationId}/task-list`
  return {
    valuesToSave,
    nextPagePath,
  }
}
