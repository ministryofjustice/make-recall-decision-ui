import { makeErrorObject } from '../../../utils/errors'
import { isValueValid } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'
import { nextPageLinkUrl } from '../helpers/urls'
import { isEmptyStringOrWhitespace, stripHtmlTags } from '../../../utils/utils'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const validateFixedTermLicenceConditions = async ({
  requestBody,
  urlInfo,
}: FormValidatorArgs): FormValidatorReturn => {
  const { hasFixedTermLicenceConditions, hasFixedTermLicenceConditionsDetails } = requestBody
  const invalid = !isValueValid(hasFixedTermLicenceConditions as string, 'yesNo')
  const missingYesDetail =
    hasFixedTermLicenceConditions === 'YES' && isEmptyStringOrWhitespace(hasFixedTermLicenceConditionsDetails)
  const hasError = !hasFixedTermLicenceConditions || invalid || missingYesDetail
  if (hasError) {
    const errors = []
    let errorId
    if (!hasFixedTermLicenceConditions || invalid) {
      errorId = 'noFixedTermLicenceConditionsSelected'
      errors.push(
        makeErrorObject({
          id: 'hasFixedTermLicenceConditions',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
    if (missingYesDetail) {
      errorId = 'missingFixedTermLicenceConditionsDetail'
      errors.push(
        makeErrorObject({
          id: 'hasFixedTermLicenceConditionsDetails',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
    const unsavedValues = {
      hasFixedTermLicenceConditions,
    }
    return {
      errors,
      unsavedValues,
    }
  }

  // valid
  const valuesToSave = {
    fixedTermAdditionalLicenceConditions: {
      selected: hasFixedTermLicenceConditions === 'YES',
      details:
        hasFixedTermLicenceConditions === 'YES' ? stripHtmlTags(hasFixedTermLicenceConditionsDetails as string) : null,
    },
  }
  return {
    valuesToSave,
    nextPagePath: nextPageLinkUrl({ nextPageId: 'sensitive-info', urlInfo }),
  }
}
