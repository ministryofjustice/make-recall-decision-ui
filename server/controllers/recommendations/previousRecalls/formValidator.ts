import { routeUrls } from '../../../routes/routeUrls'
import { strings } from '../../../textStrings/en'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'
import { getExistingRecallDates } from '../addPreviousRecall/formValidator'
import { isDefined, isNumber } from '../../../utils/utils'

export const validatePreviousRecalls = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath
  let confirmationMessage

  const { deletePreviousRecallDateIndex, previousRecallDates, continueButton } = requestBody
  const wasDeleteClicked = isDefined(deletePreviousRecallDateIndex)
  if (wasDeleteClicked) {
    const deleteIndex = parseInt(deletePreviousRecallDateIndex as string, 10)
    const existingDates = getExistingRecallDates(previousRecallDates as string)
    if (!isNumber(deleteIndex) || !existingDates.length || !existingDates[deleteIndex]) {
      errors = []
      const errorId = 'noDeletePreviousRecallIndex'
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
      text: strings.confirmations.previousRecallDeleted,
      type: 'success',
    }
    valuesToSave = {
      previousRecalls: {
        previousRecallDates: newDates,
      },
    }
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/previous-recalls`
    return {
      valuesToSave,
      nextPagePath,
      confirmationMessage,
    }
  }
  // continue button was clicked
  return {
    valuesToSave: {
      previousRecalls: {
        hasBeenRecalledPreviously: continueButton === '1',
      },
    },
    nextPagePath: `${routeUrls.recommendations}/${recommendationId}/task-list#heading-person-details`,
  }
}
