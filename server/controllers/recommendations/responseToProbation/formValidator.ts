import { makeErrorObject } from '../../../utils/errors'
import { strings } from '../../../textStrings/en'
import { nextPageLinkUrl } from '../helpers/urls'
import { isEmptyStringOrWhitespace, isString, stripHtmlTags } from '../../../utils/utils'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const validateResponseToProbation = async ({ requestBody, urlInfo }: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const { responseToProbation } = requestBody
  const sanitized = isString(responseToProbation) ? stripHtmlTags(responseToProbation as string) : ''
  if (isEmptyStringOrWhitespace(sanitized)) {
    const errorId = 'missingResponseToProbation'
    errors = [
      makeErrorObject({
        id: 'responseToProbation',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
  }
  if (!errors) {
    valuesToSave = {
      responseToProbation: sanitized,
    }
    nextPagePath = nextPageLinkUrl({ nextPageId: 'licence-conditions', urlInfo })
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
