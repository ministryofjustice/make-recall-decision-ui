import { makeErrorObject } from '../../../utils/errors'
import { strings } from '../../../textStrings/en'
import { isEmptyStringOrWhitespace, stripHtmlTags } from '../../../utils/utils'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'
import { sharedPaths } from '../../../routes/paths/shared.paths'

export const validateOffenceAnalysis = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const { offenceAnalysis } = requestBody
  if (isEmptyStringOrWhitespace(offenceAnalysis)) {
    const errorId = 'missingOffenceAnalysis'
    errors = [
      makeErrorObject({
        id: 'offenceAnalysis',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
  }
  if (!errors) {
    valuesToSave = {
      offenceAnalysis: stripHtmlTags(offenceAnalysis as string),
    }
    nextPagePath = `${sharedPaths.recommendations}/${recommendationId}/task-list#heading-person-details`
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
