import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { strings } from '../../../textStrings/en'
import { isValueValid } from '../formOptions/formOptions'

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
    valuesToSave = {
      previousReleases: {
        hasBeenReleasedPreviously: hasBeenReleasedPreviously === 'YES',
      },
    }
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/add-previous-release`
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
