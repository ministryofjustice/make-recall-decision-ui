import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { formOptions, isValueValid } from '../helpers/formOptions'
import { strings } from '../../../textStrings/en'

export const validateWhyConsideredRecall = async ({ requestBody, urlInfo }: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const { whyConsideredRecall } = requestBody
  if (!whyConsideredRecall || !isValueValid(whyConsideredRecall as string, 'whyConsideredRecall')) {
    const errorId = 'noWhyConsideredRecallSelected'
    errors = [
      makeErrorObject({
        id: 'whyConsideredRecall',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
  }
  if (!errors) {
    valuesToSave = {
      whyConsideredRecall: {
        selected: whyConsideredRecall,
        allOptions: formOptions.whyConsideredRecall,
      },
    }
    // ignore any 'fromPage' parameter, user should proceed through entire flow back to task list
    nextPagePath = `${urlInfo.basePath}reasons-no-recall`
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
