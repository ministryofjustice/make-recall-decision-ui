import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { isValueValid } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'
import { isEmptyStringOrWhitespace, stripHtmlTags } from '../../../utils/utils'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'
import { YesNoValues } from '../formOptions/yesNo'

export const validateArrestIssues = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  const { hasArrestIssues, hasArrestIssuesDetailsYes } = requestBody
  const invalidArrestIssues = !isValueValid(hasArrestIssues as string, 'yesNo')
  const missingYesDetail = hasArrestIssues === YesNoValues.YES && isEmptyStringOrWhitespace(hasArrestIssuesDetailsYes)
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
      selected: hasArrestIssues === YesNoValues.YES,
      details: hasArrestIssues === YesNoValues.YES ? stripHtmlTags(hasArrestIssuesDetailsYes as string) : null,
    },
  }
  return {
    valuesToSave,
    nextPagePath: `${routeUrls.recommendations}/${recommendationId}/task-list#heading-custody`,
  }
}
