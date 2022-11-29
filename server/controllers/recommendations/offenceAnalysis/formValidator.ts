import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { strings } from '../../../textStrings/en'
import { isEmptyStringOrWhitespace, stripHtmlTags } from '../../../utils/utils'

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
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/task-list#heading-person-details`
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
