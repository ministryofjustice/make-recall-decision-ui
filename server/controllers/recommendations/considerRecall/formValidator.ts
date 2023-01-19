import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { strings } from '../../../textStrings/en'
import { isEmptyStringOrWhitespace, stripHtmlTags, validateCrn } from '../../../utils/utils'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const validateConsiderRecall = async ({ requestBody }: FormValidatorArgs): FormValidatorReturn => {
  let errors

  const { crn, recallConsideredDetail, recommendationId } = requestBody
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
  const sanitizedDetail = stripHtmlTags(recallConsideredDetail as string)
  const valuesToSave = recommendationId
    ? {
        recallConsideredList: [
          {
            recallConsideredDetail: sanitizedDetail,
          },
        ],
      }
    : {
        crn: normalizedCrn,
        recallConsideredDetail: sanitizedDetail,
      }
  return {
    valuesToSave,
    nextPagePath: `${routeUrls.cases}/${normalizedCrn}/overview`,
  }
}
