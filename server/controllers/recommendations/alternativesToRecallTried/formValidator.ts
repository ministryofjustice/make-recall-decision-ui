import { makeErrorObject } from '../../../utils/errors'
import { formOptions, isValueValid, optionTextFromValue } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'
import { cleanseUiList, findListItemByValue } from '../../../utils/lists'
import { isEmptyStringOrWhitespace, isString, stripHtmlTags } from '../../../utils/utils'
import { FormOption, FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const validateAlternativesTried = async ({ requestBody }: FormValidatorArgs): FormValidatorReturn => {
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
    const detail = requestBody[`alternativesToRecallTriedDetail-${alternativeId}`]
    const sanitizedDetail = isString(detail) ? stripHtmlTags(detail as string) : ''
    if (optionShouldHaveDetails && isEmptyStringOrWhitespace(sanitizedDetail)) {
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
        const label = optionTextFromValue(alternativeId, 'alternativesToRecallTried')
        const [firstLetter, ...rest] = label
        const lowerCased = `${firstLetter.toLowerCase()}${rest.join('')}`
        errors.push(
          makeErrorObject({
            id: `alternativesToRecallTriedDetail-${alternativeId}`,
            text: `${strings.errors.missingDetail} for ${lowerCased}`,
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
      selected: alternativesList.map(alternative => {
        const details = requestBody[`alternativesToRecallTriedDetail-${alternative}`]
        return {
          value: alternative,
          details: details ? stripHtmlTags(details as string) : undefined,
        }
      }),
      allOptions: cleanseUiList(formOptions.alternativesToRecallTried),
    },
  }

  return { valuesToSave }
}
