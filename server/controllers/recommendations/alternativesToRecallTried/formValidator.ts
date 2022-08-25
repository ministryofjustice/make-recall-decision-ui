import { FormOption, FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { formOptions, isValueValid, optionTextFromValue } from '../helpers/formOptions'
import { strings } from '../../../textStrings/en'
import { cleanseUiList, findListItemByValue } from '../../../utils/lists'

export const validateAlternativesTried = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  const { alternativesToRecallTried } = requestBody
  const alternativesList = Array.isArray(alternativesToRecallTried)
    ? alternativesToRecallTried
    : [alternativesToRecallTried]
  const invalidAlternative = alternativesList.some(
    alternativeId => !isValueValid(alternativeId, 'alternativesToRecallTried')
  )
  const missingDetails = alternativesList.filter(alternativeId => {
    const optionShouldHaveDetails = Boolean(
      findListItemByValue<FormOption>({
        items: formOptions.alternativesToRecallTried,
        value: alternativeId,
      })?.detailsLabel
    )
    if (optionShouldHaveDetails && !requestBody[`alternativesToRecallTriedDetail-${alternativeId}`]) {
      return alternativeId
    }
    return false
  })
  const hasError = !alternativesToRecallTried || missingDetails.length
  if (hasError) {
    const errors = []
    let errorId
    if (!alternativesToRecallTried || invalidAlternative) {
      errorId = 'noAlternativesTriedSelected'
      errors.push(
        makeErrorObject({
          id: 'alternativesToRecallTried',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
    if (missingDetails.length) {
      missingDetails.forEach(alternativeId => {
        errorId = 'missingAlternativesTriedDetail'
        errors.push(
          makeErrorObject({
            id: `alternativesToRecallTriedDetail-${alternativeId}`,
            text: `${strings.errors.missingDetail} for ${optionTextFromValue(
              alternativeId,
              'alternativesToRecallTried'
            ).toLowerCase()}`,
            errorId,
          })
        )
      })
    }
    const unsavedValues = {
      alternativesToRecallTried: alternativesList.map(alternativeId => ({
        value: alternativeId,
        details: requestBody[`alternativesToRecallTriedDetail-${alternativeId}`],
      })),
    }
    return {
      errors,
      unsavedValues,
    }
  }

  // valid
  const valuesToSave = {
    alternativesToRecallTried: {
      selected: alternativesList.map(alternative => ({
        value: alternative,
        details: requestBody[`alternativesToRecallTriedDetail-${alternative}`],
      })),
      allOptions: cleanseUiList(formOptions.alternativesToRecallTried),
    },
  }
  return {
    valuesToSave,
    nextPagePath: `${routeUrls.recommendations}/${recommendationId}/stop-think`,
  }
}
