import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { strings } from '../../../textStrings/en'
import { nextPageLinkUrl } from '../helpers/urls'

export const validateResponseToProbation = async ({ requestBody, urlInfo }: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const { responseToProbation } = requestBody
  if (!responseToProbation) {
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
      responseToProbation,
    }
    nextPagePath = nextPageLinkUrl({ nextPageId: 'licence-conditions', urlInfo })
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
