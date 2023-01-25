import { formatValidationErrorMessage, invalidDateInputPart, makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { dateHasError } from '../../../utils/dates'
import { ValidationError } from '../../../@types/dates'
import { convertGmtDatePartsToUtc } from '../../../utils/dates/convert'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const getExistingReleaseDates = (previousReleaseDates?: string) => {
  if (!previousReleaseDates) return []
  return previousReleaseDates?.split('|').filter(Boolean)
}

export const validateAddPreviousRelease = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const previousReleaseDateParts = {
    day: requestBody['previousReleaseDate-day'],
    month: requestBody['previousReleaseDate-month'],
    year: requestBody['previousReleaseDate-year'],
  }
  const previousReleaseDateIso = convertGmtDatePartsToUtc(previousReleaseDateParts as Record<string, string>, {
    includeTime: false,
    dateMustBeInPast: true,
    validatePartLengths: false,
  })

  // other errors
  if (dateHasError(previousReleaseDateIso)) {
    errors = []
    errors.push(
      makeErrorObject({
        name: 'previousReleaseDate',
        id: invalidDateInputPart(previousReleaseDateIso as ValidationError, 'previousReleaseDate'),
        text: formatValidationErrorMessage(previousReleaseDateIso as ValidationError, 'previous release date'),
        errorId: (previousReleaseDateIso as ValidationError).errorId,
        values: previousReleaseDateParts as Record<string, string>,
      })
    )
    const unsavedValues = {
      previousReleaseDateParts,
    }
    return {
      errors,
      unsavedValues,
    }
  }

  if (!errors) {
    const existingDates = getExistingReleaseDates(requestBody.previousReleaseDates as string)
    const previousReleaseDates = [...existingDates, previousReleaseDateIso]
    valuesToSave = {
      previousReleases: {
        previousReleaseDates,
      },
    }
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/previous-releases`
    return {
      valuesToSave,
      nextPagePath,
    }
  }
}
