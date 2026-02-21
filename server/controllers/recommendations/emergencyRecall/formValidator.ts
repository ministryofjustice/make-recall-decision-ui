import { makeErrorObject } from '../../../utils/errors'
import { isValueValid } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'
import { nextPageLinkUrl } from '../helpers/urls'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'
import { YesNoValues } from '../formOptions/yesNo'

export const validateEmergencyRecall = async ({ requestBody, urlInfo }: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const { isThisAnEmergencyRecall, recallType } = requestBody
  if (!isThisAnEmergencyRecall || !isValueValid(isThisAnEmergencyRecall as string, 'yesNo')) {
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
      isThisAnEmergencyRecall: isThisAnEmergencyRecall === YesNoValues.YES,
    }
    const nextPageId = recallType === 'FIXED_TERM' ? 'fixed-licence' : 'sensitive-info'
    nextPagePath = nextPageLinkUrl({ nextPageId, urlInfo })
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
