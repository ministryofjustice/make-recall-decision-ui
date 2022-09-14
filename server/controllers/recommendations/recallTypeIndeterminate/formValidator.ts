import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { formOptions, isValueValid } from '../helpers/formOptions'
import { strings } from '../../../textStrings/en'
import { nextPageLinkUrl } from '../helpers/urls'

export const validateRecallTypeIndeterminate = async ({
  requestBody,
  urlInfo,
}: FormValidatorArgs): FormValidatorReturn => {
  const { recallType } = requestBody
  const invalidRecallTypeIndeterminate = !isValueValid(recallType as string, 'recallTypeIndeterminate')
  const hasError = !recallType || invalidRecallTypeIndeterminate
  if (hasError) {
    const errors = []
    let errorId
    if (!recallType || invalidRecallTypeIndeterminate) {
      errorId = 'noRecallTypeSelected'
      errors.push(
        makeErrorObject({
          id: 'recallType',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
    const unsavedValues = {
      recallType,
    }
    return {
      errors,
      unsavedValues,
    }
  }

  // valid
  const valuesToSave = {
    recallType: {
      selected: {
        value: recallType,
      },
      allOptions: formOptions.recallType,
    },
  }
  const nextPagePath =
    recallType === 'NO_RECALL'
      ? `${urlInfo.basePath}start-no-recall`
      : nextPageLinkUrl({ nextPageId: 'sensitive-info', urlInfo })
  return {
    valuesToSave,
    nextPagePath,
  }
}
