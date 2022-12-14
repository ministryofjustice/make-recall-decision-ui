import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { strings } from '../../../textStrings/en'
import { isEmptyStringOrWhitespace, stripHtmlTags, validateCrn } from '../../../utils/utils'

export const validateConsiderRecall = async ({ requestBody }: FormValidatorArgs): FormValidatorReturn => {
  let errors

  const { crn, recallConsideredDetail } = requestBody
  const normalizedCrn = validateCrn(crn)
  if (isEmptyStringOrWhitespace(recallConsideredDetail)) {
    const errorId = 'missingRecallConsideredDetail'
    errors = [
      makeErrorObject({
        id: 'recallConsideredDetail',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
  }
  if (errors) {
    return {
      errors,
      nextPagePath: `${routeUrls.cases}/${normalizedCrn}/consider-recall`,
    }
  }
  return {
    valuesToSave: {
      crn: normalizedCrn,
      recallConsideredDetail: stripHtmlTags(recallConsideredDetail as string),
    },
    nextPagePath: `${routeUrls.cases}/${normalizedCrn}/overview`,
  }
}
