import { formatValidationErrorMessage, invalidDateInputPart, makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { dateHasError } from '../../../utils/dates'
import { ValidationError } from '../../../@types/dates'
import { convertGmtDatePartsToUtc } from '../../../utils/dates/convert'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const getExistingRecallDates = (previousRecallDates?: string) => {
  if (!previousRecallDates) return []
  return previousRecallDates?.split('|').filter(Boolean)
}

export const validateAddPreviousRecall = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const previousRecallDateParts = {
    day: requestBody['previousRecallDate-day'],
    month: requestBody['previousRecallDate-month'],
    year: requestBody['previousRecallDate-year'],
  }
  const previousRecallDateIso = convertGmtDatePartsToUtc(previousRecallDateParts as Record<string, string>, {
    includeTime: false,
    dateMustBeInPast: true,
    validatePartLengths: false,
  })

  // other errors
  if (dateHasError(previousRecallDateIso)) {
    errors = []
    errors.push(
      makeErrorObject({
        name: 'previousRecallDate',
        id: invalidDateInputPart(previousRecallDateIso as ValidationError, 'previousRecallDate'),
        text: formatValidationErrorMessage(previousRecallDateIso as ValidationError, 'previous recall date'),
        errorId: (previousRecallDateIso as ValidationError).errorId,
        values: previousRecallDateParts as Record<string, string>,
      })
    )
    const unsavedValues = {
      previousRecallDateParts,
    }
    return {
      errors,
      unsavedValues,
    }
  }

  if (!errors) {
    const existingDates = getExistingRecallDates(requestBody.previousRecallDates as string)
    const previousRecallDates = [...existingDates, previousRecallDateIso]
    valuesToSave = {
      previousRecalls: {
        previousRecallDates,
      },
    }
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/previous-recalls`
    return {
      valuesToSave,
      nextPagePath,
    }
  }
}
