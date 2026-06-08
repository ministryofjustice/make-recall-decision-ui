import { makeErrorObject } from '../../../utils/errors'
import { formOptions, isValueValid } from '../formOptions/formOptions'
import strings from '../../../textStrings/en'
import { nextPageLinkUrl } from '../helpers/urls'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

const validateCustodyStatus = async ({ requestBody, urlInfo }: FormValidatorArgs & {}): FormValidatorReturn => {
  let errors

  const { custodyStatus } = requestBody
  const invalidStatus = !custodyStatus || !isValueValid(custodyStatus as string, 'custodyStatus')
  if (invalidStatus) {
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
