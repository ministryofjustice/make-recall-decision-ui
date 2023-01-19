import { formatValidationErrorMessage, invalidDateInputPart, makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { dateHasError } from '../../../utils/dates'
import { ValidationError } from '../../../@types/dates'
import { convertGmtDatePartsToUtc } from '../../../utils/dates/convert'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const validateVictimLiaisonOfficer = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const dateVloInformedParts = {
    day: requestBody['dateVloInformed-day'],
    month: requestBody['dateVloInformed-month'],
    year: requestBody['dateVloInformed-year'],
  }
  const dateVloInformedIso = convertGmtDatePartsToUtc(dateVloInformedParts as Record<string, string>, {
    includeTime: false,
    dateMustBeInPast: true,
    validatePartLengths: false,
  })

  // other errors
  if (dateHasError(dateVloInformedIso)) {
    errors = []
    errors.push(
      makeErrorObject({
        name: 'dateVloInformed',
        id: invalidDateInputPart(dateVloInformedIso as ValidationError, 'dateVloInformed'),
        text: formatValidationErrorMessage(dateVloInformedIso as ValidationError, 'date you told the VLO'),
        errorId: (dateVloInformedIso as ValidationError).errorId,
        values: dateVloInformedParts as Record<string, string>,
      })
    )
    const unsavedValues = {
      dateVloInformedParts,
    }
    return {
      errors,
      unsavedValues,
    }
  }

  if (!errors) {
    valuesToSave = {
      dateVloInformed: dateVloInformedIso,
    }
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/task-list#heading-victim-liaison`
    return {
      valuesToSave,
      nextPagePath,
    }
  }
}
