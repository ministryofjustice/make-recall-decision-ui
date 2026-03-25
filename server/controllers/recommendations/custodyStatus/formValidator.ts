import { makeErrorObject } from '../../../utils/errors'
import { formOptions, isValueValid } from '../formOptions/formOptions'
import strings from '../../../textStrings/en'
import { nextPageLinkUrl } from '../helpers/urls'
import { isEmptyStringOrWhitespace, stripHtmlTags } from '../../../utils/utils'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

const validateCustodyStatus = async ({
  requestBody,
  urlInfo,
  ftr56Enabled,
}: FormValidatorArgs & {
  ftr56Enabled?: boolean
}): FormValidatorReturn => {
  let errors

  const { custodyStatus, custodyStatusDetailsYesPolice } = requestBody
  const invalidStatus = !custodyStatus || !isValueValid(custodyStatus as string, 'custodyStatus')
  const missingPoliceCustodyAddress =
    !ftr56Enabled && custodyStatus === 'YES_POLICE' && isEmptyStringOrWhitespace(custodyStatusDetailsYesPolice)
  if (invalidStatus || missingPoliceCustodyAddress) {
    errors = []
    if (invalidStatus) {
      const errorId = 'noCustodyStatusSelected'
      errors.push(
        makeErrorObject({
          id: 'custodyStatus',
          text: strings.errors[errorId],
          errorId,
        }),
      )
    }
    if (missingPoliceCustodyAddress) {
      const errorId = 'missingCustodyPoliceAddressDetail'
      errors.push(
        makeErrorObject({
          id: 'custodyStatusDetailsYesPolice',
          text: strings.errors[errorId],
          errorId,
        }),
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
      details:
        !ftr56Enabled && custodyStatus === 'YES_POLICE' ? stripHtmlTags(custodyStatusDetailsYesPolice as string) : null,
      allOptions: formOptions.custodyStatus,
    },
  }
  const nextPagePath = nextPageLinkUrl({ nextPageId: 'task-list', urlInfo })
  return {
    valuesToSave,
    nextPagePath,
  }
}

export default validateCustodyStatus
