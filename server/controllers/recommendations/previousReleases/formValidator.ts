import { routeUrls } from '../../../routes/routeUrls'
import { strings } from '../../../textStrings/en'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'
import { getExistingReleaseDates } from '../addPreviousRelease/formValidator'
import { isDefined, isNumber } from '../../../utils/utils'

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
  return {
    valuesToSave: {
      previousReleases: {
        hasBeenReleasedPreviously: continueButton === '1',
      },
    },
    nextPagePath: `${routeUrls.recommendations}/${recommendationId}/task-list#heading-person-details`,
  }
}
