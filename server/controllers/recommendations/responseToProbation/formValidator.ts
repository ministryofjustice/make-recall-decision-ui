import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { strings } from '../../../textStrings/en'

export const validateResponseToProbation = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
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
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/licence-conditions`
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
