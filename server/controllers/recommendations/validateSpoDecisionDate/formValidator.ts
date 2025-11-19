import { formatValidationErrorMessage, invalidDateInputPart, makeErrorObject } from '../../../utils/errors'
import { dateHasError } from '../../../utils/dates'
import { ValidationError } from '../../../@types/dates'
import { convertGmtDatePartsToUtc } from '../../../utils/dates/conversion'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const validateDateTime = async ({ requestBody }: FormValidatorArgs): FormValidatorReturn => {
  let errors

  const dateTimeParts = {
    day: requestBody['dateTime-day'],
    month: requestBody['dateTime-month'],
    year: requestBody['dateTime-year'],
    hour: requestBody['dateTime-hour'],
    minute: requestBody['dateTime-minute'],
  }
  const dateTimeIso = convertGmtDatePartsToUtc(dateTimeParts as Record<string, string>, {
    includeTime: true,
    dateMustBeInFuture: false,
    dateMustBeInPast: true,
    validatePartLengths: false,
  })

  if (dateHasError(dateTimeIso)) {
    errors = []
    if (dateHasError(dateTimeIso)) {
      errors.push(
        makeErrorObject({
          name: 'dateTime',
          id: invalidDateInputPart(dateTimeIso as ValidationError, 'dateTime'),
          text: formatValidationErrorMessage(dateTimeIso as ValidationError, 'date the SPO agreed the recall'),
          errorId: (dateTimeIso as ValidationError).errorId,
          invalidParts: (dateTimeIso as ValidationError).invalidParts,
          values: dateTimeParts as Record<string, string>,
        })
      )
    }
    const unsavedValues = {
      dateTime: dateTimeParts,
    }
    return {
      errors,
      unsavedValues,
    }
  }
  if (!errors) {
    const valuesToSave = { decisionDateTime: dateTimeIso.toString() }
    return {
      valuesToSave,
    }
  }
}
