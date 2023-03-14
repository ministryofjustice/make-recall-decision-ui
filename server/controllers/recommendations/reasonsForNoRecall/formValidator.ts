import { makeErrorObject } from '../../../utils/errors'
import { strings } from '../../../textStrings/en'
import { isEmptyStringOrWhitespace, stripHtmlTags } from '../../../utils/utils'
import { nextPageLinkUrl } from '../helpers/urls'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const validateReasonsForNoRecall = async ({ requestBody, urlInfo }: FormValidatorArgs): FormValidatorReturn => {
  let errors

  const { licenceBreach, noRecallRationale, popProgressMade, popThoughts, futureExpectations } = requestBody
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
        popThoughts,
        futureExpectations,
      },
    }
  }
  return {
    valuesToSave: {
      reasonsForNoRecall: {
        licenceBreach: stripHtmlTags(licenceBreach as string),
        noRecallRationale: stripHtmlTags(noRecallRationale as string),
        popProgressMade: stripHtmlTags(popProgressMade as string),
        popThoughts: stripHtmlTags(popThoughts as string),
        futureExpectations: stripHtmlTags(futureExpectations as string),
      },
    },
    nextPagePath: nextPageLinkUrl({ nextPageId: 'appointment-no-recall', urlInfo }),
  }
}
