import { makeErrorObject } from '../../../utils/errors'
import { formOptions, isValueValid } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'
import { nextPageLinkUrl } from '../helpers/urls'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

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
    nextPagePath = nextPageLinkUrl({ nextPageId: 'reasons-no-recall', urlInfo })
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
