import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { strings } from '../../../textStrings/en'

export const validateReasonsForNoRecall = async ({ requestBody, urlInfo }: FormValidatorArgs): FormValidatorReturn => {
  let errors

  const { licenceBreach, noRecallRationale, popProgressMade, futureExpectations } = requestBody
  if (!licenceBreach || !noRecallRationale || !popProgressMade || !futureExpectations) {
    errors = []
    if (!licenceBreach) {
      errors.push({ id: 'licenceBreach', errorId: 'noRecallLicenceBreachDetails' })
    }
    if (!noRecallRationale) {
      errors.push({ id: 'noRecallRationale', errorId: 'noRecallRationale' })
    }
    if (!noRecallRationale) {
      errors.push({ id: 'popProgressMade', errorId: 'noRecallPopProgressMade' })
    }
    if (!futureExpectations) {
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
    nextPagePath: `${urlInfo.basePath}task-list-no-recall`,
  }
}
