import { makeErrorObject } from '../../../utils/errors'
import { formOptions, isValueValid } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'
import { isInCustody } from '../helpers/isInCustody'
import { CustodyStatus } from '../../../@types/make-recall-decision-api'
import { nextPageLinkUrl } from '../helpers/urls'
import { isEmptyStringOrWhitespace, stripHtmlTags } from '../../../utils/utils'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const validateCustodyStatus = async ({ requestBody, urlInfo }: FormValidatorArgs): FormValidatorReturn => {
  let errors

  const { custodyStatus, custodyStatusDetailsYesPolice } = requestBody
  const invalidStatus = !custodyStatus || !isValueValid(custodyStatus as string, 'custodyStatus')
  const missingPoliceCustodyAddress =
    custodyStatus === 'YES_POLICE' && isEmptyStringOrWhitespace(custodyStatusDetailsYesPolice)
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
  const inCustody = isInCustody(custodyStatus as CustodyStatus.selected)
  const resets = inCustody
    ? {
        hasArrestIssues: null,
        localPoliceContact: null,
      }
    : {}
  const valuesToSave = {
    custodyStatus: {
      selected: custodyStatus,
      details: custodyStatus === 'YES_POLICE' ? stripHtmlTags(custodyStatusDetailsYesPolice as string) : null,
      allOptions: formOptions.custodyStatus,
    },
    ...resets,
  }
  const nextPagePath = nextPageLinkUrl({ nextPageId: 'task-list', urlInfo })
  return {
    valuesToSave,
    nextPagePath,
  }
}
