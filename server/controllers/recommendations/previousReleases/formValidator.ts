import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { strings } from '../../../textStrings/en'
import { stripHtmlTags } from '../../../utils/utils'
import { isValueValid } from '../formOptions/formOptions'

export const validatePreviousReleases = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const { hasBeenReleasedPreviously, lastReleaseDate, lastReleasingPrisonOrCustodialEstablishment } = requestBody
  const invalidHasBeenReleased =
    !hasBeenReleasedPreviously || !isValueValid(hasBeenReleasedPreviously as string, 'yesNo')
  if (invalidHasBeenReleased || !lastReleaseDate || !lastReleasingPrisonOrCustodialEstablishment) {
    errors = []
    if (invalidHasBeenReleased) {
      const errorId = 'noHasBeenReleasedPreviouslySelected'
      errors.push(
        makeErrorObject({
          id: 'hasBeenReleasedPreviously',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
    if (!lastReleaseDate) {
      const errorId = 'invalidLastReleaseDate'
      errors.push(
        makeErrorObject({
          id: 'lastReleaseDate',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
    if (!lastReleasingPrisonOrCustodialEstablishment) {
      const errorId = 'invalidLastReleasingPrisonOrCustodialEstablishment'
      errors.push(
        makeErrorObject({
          id: 'lastReleasingPrisonOrCustodialEstablishment',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
  }
  if (!errors) {
    valuesToSave = {
      previousReleases: {
        lastReleaseDate,
        lastReleasingPrisonOrCustodialEstablishment: stripHtmlTags(
          lastReleasingPrisonOrCustodialEstablishment as string
        ),
        hasBeenReleasedPreviously: hasBeenReleasedPreviously === 'YES',
      },
    }
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/task-list#heading-person-details` // add-previous-release`
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
