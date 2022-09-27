import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { strings } from '../../../textStrings/en'
import { isEmptyStringOrWhitespace } from '../../../utils/utils'

export const validateReasonsForNoRecall = async ({ requestBody, urlInfo }: FormValidatorArgs): FormValidatorReturn => {
  let errors

  const { licenceBreach, noRecallRationale, popProgressMade, futureExpectations } = requestBody
  if (
    isEmptyStringOrWhitespace(licenceBreach) ||
    isEmptyStringOrWhitespace(noRecallRationale) ||
    isEmptyStringOrWhitespace(popProgressMade) ||
    isEmptyStringOrWhitespace(futureExpectations)
  ) {
    errors = []
    if (isEmptyStringOrWhitespace(licenceBreach)) {
      errors.push({ id: 'licenceBreach', errorId: 'noRecallLicenceBreachDetails' })
    }
    if (isEmptyStringOrWhitespace(noRecallRationale)) {
      errors.push({ id: 'noRecallRationale', errorId: 'noRecallRationale' })
    }
    if (isEmptyStringOrWhitespace(popProgressMade)) {
      errors.push({ id: 'popProgressMade', errorId: 'noRecallPopProgressMade' })
    }
    if (isEmptyStringOrWhitespace(futureExpectations)) {
      errors.push({ id: 'futureExpectations', errorId: 'noRecallFutureExpectations' })
    }
    errors = errors.map(({ id, errorId }) =>
      makeErrorObject({
        id,
        text: strings.errors[errorId],
        errorId,
      })
    )
    return {
      errors,
      unsavedValues: {
        licenceBreach,
        noRecallRationale,
        popProgressMade,
        futureExpectations,
      },
    }
  }
  return {
    valuesToSave: {
      reasonsForNoRecall: {
        licenceBreach,
        noRecallRationale,
        popProgressMade,
        futureExpectations,
      },
    },
    nextPagePath: `${urlInfo.basePath}appointment-no-recall`,
  }
}
