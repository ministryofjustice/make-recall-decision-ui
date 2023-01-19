import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { strings } from '../../../textStrings/en'
import { isValueValid } from '../formOptions/formOptions'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const validatePreviousReleases = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const { hasBeenReleasedPreviously } = requestBody
  if (!hasBeenReleasedPreviously || !isValueValid(hasBeenReleasedPreviously as string, 'yesNo')) {
    errors = []
    const errorId = 'noHasBeenReleasedPreviouslySelected'
    errors.push(
      makeErrorObject({
        id: 'hasBeenReleasedPreviously',
        text: strings.errors[errorId],
        errorId,
      })
    )
  }
  if (!errors) {
    const isYes = hasBeenReleasedPreviously === 'YES'
    const nextPageId = isYes ? 'add-previous-release' : 'task-list#heading-person-details'
    valuesToSave = {
      previousReleases: {
        hasBeenReleasedPreviously: isYes,
        ...(!isYes ? { previousReleaseDates: null } : {}), // if No selected, reset previous release dates to null
      },
    }
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/${nextPageId}`
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
