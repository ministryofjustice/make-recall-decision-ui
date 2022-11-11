import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { formOptions, isValueValid } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'

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
      errorId = 'noRecallTypeIndeterminateSelected'
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
  const isNoRecall = recallType === 'NO_RECALL'
  const valuesToSave = {
    recallType: {
      selected: {
        value: isNoRecall ? recallType : 'STANDARD',
      },
      allOptions: formOptions.recallTypeIndeterminateApi,
    },
    isThisAnEmergencyRecall: isNoRecall ? null : true,
  }
  const nextPageId = isNoRecall ? 'task-list-no-recall' : 'indeterminate-details'
  return {
    valuesToSave,
    nextPagePath: `${urlInfo.basePath}${nextPageId}`,
  }
}
