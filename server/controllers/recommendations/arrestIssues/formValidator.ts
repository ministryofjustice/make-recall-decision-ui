import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { isValueValid } from '../helpers/formOptions'
import { strings } from '../../../textStrings/en'

export const validateArrestIssues = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  const { hasArrestIssues, hasArrestIssuesDetailsYes } = requestBody
  const invalidArrestIssues = !isValueValid(hasArrestIssues as string, 'hasArrestIssues')
  const missingYesDetail = hasArrestIssues === 'YES' && !hasArrestIssuesDetailsYes
  const hasError = !hasArrestIssues || invalidArrestIssues || missingYesDetail
  if (hasError) {
    const errors = []
    let errorId
    if (!hasArrestIssues || invalidArrestIssues) {
      errorId = 'noArrestIssuesSelected'
      errors.push(
        makeErrorObject({
          id: 'hasArrestIssues',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
    if (missingYesDetail) {
      errorId = 'missingArrestIssuesDetail'
      errors.push(
        makeErrorObject({
          id: 'hasArrestIssuesDetailsYes',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
    const unsavedValues = {
      hasArrestIssues,
    }
    return {
      errors,
      unsavedValues,
    }
  }

  // valid
  const valuesToSave = {
    hasArrestIssues: {
      selected: hasArrestIssues === 'YES',
      details: hasArrestIssues === 'YES' ? hasArrestIssuesDetailsYes : null,
    },
  }
  return {
    valuesToSave,
    nextPagePath: `${routeUrls.recommendations}/${recommendationId}/confirmation-part-a`,
  }
}
