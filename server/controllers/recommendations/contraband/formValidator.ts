import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { isValueValid } from '../helpers/formOptions'
import { strings } from '../../../textStrings/en'
import { isEmptyStringOrWhitespace } from '../../../utils/utils'

export const validateContraband = async ({ requestBody, recommendationId }: FormValidatorArgs): FormValidatorReturn => {
  const { hasContrabandRisk, hasContrabandRiskDetailsYes } = requestBody
  const invalidContraband = !isValueValid(hasContrabandRisk as string, 'hasContrabandRisk')
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
      details: hasContrabandRisk === 'YES' ? hasContrabandRiskDetailsYes : null,
    },
  }
  return {
    valuesToSave,
    nextPagePath: `${routeUrls.recommendations}/${recommendationId}/task-list#heading-custody`,
  }
}
