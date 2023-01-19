import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { isValueValid } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'
import { isEmptyStringOrWhitespace, stripHtmlTags } from '../../../utils/utils'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const validateContraband = async ({ requestBody, recommendationId }: FormValidatorArgs): FormValidatorReturn => {
  const { hasContrabandRisk, hasContrabandRiskDetailsYes } = requestBody
  const invalidContraband = !isValueValid(hasContrabandRisk as string, 'yesNo')
  const missingYesDetail =
    hasContrabandRisk === 'YES' && isEmptyStringOrWhitespace(hasContrabandRiskDetailsYes as string)
  const hasError = !hasContrabandRisk || invalidContraband || missingYesDetail
  if (hasError) {
    const errors = []
    let errorId
    if (!hasContrabandRisk || invalidContraband) {
      errorId = 'noContrabandSelected'
      errors.push(
        makeErrorObject({
          id: 'hasContrabandRisk',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
    if (missingYesDetail) {
      errorId = 'missingContrabandDetail'
      errors.push(
        makeErrorObject({
          id: 'hasContrabandRiskDetailsYes',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
    const unsavedValues = {
      hasContrabandRisk,
    }
    return {
      errors,
      unsavedValues,
    }
  }

  // valid
  const valuesToSave = {
    hasContrabandRisk: {
      selected: hasContrabandRisk === 'YES',
      details: hasContrabandRisk === 'YES' ? stripHtmlTags(hasContrabandRiskDetailsYes as string) : null,
    },
  }
  return {
    valuesToSave,
    nextPagePath: `${routeUrls.recommendations}/${recommendationId}/task-list#heading-custody`,
  }
}
