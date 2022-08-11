import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { strings } from '../../../textStrings/en'

export const validateResponseToProbation = ({
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
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/recall-type`
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
