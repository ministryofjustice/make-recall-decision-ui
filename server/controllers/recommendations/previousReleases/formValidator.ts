import { routeUrls } from '../../../routes/routeUrls'
import { strings } from '../../../textStrings/en'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'
import { getExistingReleaseDates } from '../addPreviousRelease/formValidator'
import { isDefined, isNumber } from '../../../utils/utils'
import { isValueValid } from '../formOptions/formOptions'
import { convertGmtDatePartsToUtc, extractDateFieldsToDateParts } from '../../../utils/dates/conversion'
import { dateHasError } from '../../../utils/dates'
import { formatValidationErrorMessage, invalidDateInputPart, makeErrorObject } from '../../../utils/errors'
import { ValidationError } from '../../../@types/dates'

export const validatePreviousReleases = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath
  let confirmationMessage

  const { deletePreviousReleaseDateIndex, previousReleaseDates, continueButton } = requestBody
  const wasDeleteClicked = isDefined(deletePreviousReleaseDateIndex)
  if (wasDeleteClicked) {
    const deleteIndex = parseInt(deletePreviousReleaseDateIndex as string, 10)
    const existingDates = getExistingReleaseDates(previousReleaseDates as string)
    if (!isNumber(deleteIndex) || !existingDates.length || !existingDates[deleteIndex]) {
      errors = []
      const errorId = 'noDeletePreviousReleaseIndex'
      errors.push({
        name: errorId,
        text: strings.errors[errorId],
        errorId,
      })
    }
    if (errors) {
      return {
        errors,
      }
    }
    const newDates = existingDates.filter((_, index) => index !== deleteIndex)
    confirmationMessage = {
      text: strings.confirmations.previousReleaseDeleted,
      type: 'success',
    }
    valuesToSave = {
      previousReleases: {
        previousReleaseDates: newDates,
      },
    }
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/previous-releases`
    return {
      valuesToSave,
      nextPagePath,
      confirmationMessage,
    }
  }
  // continue button was clicked

  const { releaseUnderECSL } = requestBody

  let dateOfReleaseIso
  let conditionalReleaseDateIso
  let unsavedValues = {}

  errors = []

  const invalidSelection = !isValueValid(releaseUnderECSL as string, 'yesNo')

  if (invalidSelection) {
    errors.push(
      makeErrorObject({
        id: 'releaseUnderECSL',
        text: strings.errors.noReleaseUnderECSLSelected,
        errorId: 'noReleaseUnderECSLSelected',
      })
    )
  } else if (releaseUnderECSL === 'YES') {
    const dateOfRelease = extractDateFieldsToDateParts('dateOfRelease', requestBody)

    dateOfReleaseIso = convertGmtDatePartsToUtc(dateOfRelease, {
      includeTime: false,
      dateMustBeInPast: false,
      validatePartLengths: false,
    }) as ValidationError

    if (dateHasError(dateOfReleaseIso)) {
      errors.push(
        makeErrorObject({
          name: 'dateOfRelease',
          id: invalidDateInputPart(dateOfReleaseIso, 'dateOfRelease'),
          text: formatValidationErrorMessage(dateOfReleaseIso, 'date of release'),
          errorId: dateOfReleaseIso.errorId,
          values: dateOfRelease as Record<string, string>,
        })
      )
    }

    const conditionalReleaseDate = extractDateFieldsToDateParts('conditionalReleaseDate', requestBody)

    conditionalReleaseDateIso = convertGmtDatePartsToUtc(conditionalReleaseDate, {
      includeTime: false,
      dateMustBeInPast: false,
      validatePartLengths: false,
    }) as ValidationError

    if (dateHasError(conditionalReleaseDateIso)) {
      errors.push(
        makeErrorObject({
          name: 'conditionalReleaseDate',
          id: invalidDateInputPart(conditionalReleaseDateIso, 'conditionalReleaseDate'),
          text: formatValidationErrorMessage(conditionalReleaseDateIso, 'conditional release date'),
          errorId: conditionalReleaseDateIso.errorId,
          values: conditionalReleaseDate as Record<string, string>,
        })
      )
    }

    unsavedValues = {
      releaseUnderECSL,
      dateOfRelease,
      conditionalReleaseDate,
    }
  }

  if (errors.length > 0) {
    return {
      errors,
      unsavedValues,
    }
  }

  const isReleaseUnderECSL = releaseUnderECSL === 'YES'

  return {
    valuesToSave: {
      previousReleases: {
        hasBeenReleasedPreviously: continueButton === '1',
      },
      releaseUnderECSL: isReleaseUnderECSL,
      dateOfRelease: isReleaseUnderECSL ? dateOfReleaseIso : '',
      conditionalReleaseDate: isReleaseUnderECSL ? conditionalReleaseDateIso : '',
    },
    nextPagePath: `${routeUrls.recommendations}/${recommendationId}/task-list#heading-person-details`,
  }
}
