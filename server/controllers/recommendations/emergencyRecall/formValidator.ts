import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { isValueValid } from '../helpers/formOptions'
import { strings } from '../../../textStrings/en'
import { nextPageLinkUrl } from '../helpers/urls'

export const validateEmergencyRecall = async ({ requestBody, urlInfo }: FormValidatorArgs): FormValidatorReturn => {
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
    nextPagePath = nextPageLinkUrl({ nextPageId: 'custody-status', urlInfo })
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
