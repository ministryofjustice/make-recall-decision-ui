import { makeErrorObject } from '../../../utils/errors'
import { strings } from '../../../textStrings/en'
import { isEmptyStringOrWhitespace, stripHtmlTags, validateCrn } from '../../../utils/utils'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'
import { sharedPaths } from '../../../routes/paths/shared.paths'

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
      nextPagePath: `${sharedPaths.cases}/${normalizedCrn}/consider-recall`,
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
    nextPagePath: `${sharedPaths.cases}/${normalizedCrn}/overview`,
  }
}
