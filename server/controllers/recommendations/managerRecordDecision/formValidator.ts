import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { formOptions, isValueValid } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'
import { isEmptyStringOrWhitespace, isString, stripHtmlTags } from '../../../utils/utils'

export const validateManagerRecordDecision = async ({
  requestBody,
  urlInfo,
}: FormValidatorArgs): FormValidatorReturn => {
  const { recallTypeManager, recallTypeManagerDetail } = requestBody
  const invalidRecallType = !isValueValid(recallTypeManager as string, 'recallTypeManager')
  const missingDetail = isEmptyStringOrWhitespace(recallTypeManagerDetail)
  const hasError = !recallTypeManager || invalidRecallType || missingDetail
  if (hasError) {
    const errors = []
    let errorId
    if (missingDetail) {
      errorId = 'missingManagerRecallTypeDetail'
      errors.push(
        makeErrorObject({
          id: 'recallTypeManagerDetail',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
    if (!recallTypeManager || invalidRecallType) {
      errorId = 'noManagerRecallTypeSelected'
      errors.push(
        makeErrorObject({
          id: 'recallTypeManager',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
    const unsavedValues = {
      recallTypeManager,
      recallTypeManagerDetail,
    }
    return {
      errors,
      unsavedValues,
    }
  }

  const valuesToSave = {
    managerRecallDecision: {
      selected: {
        value: recallTypeManager,
        details: isString(recallTypeManagerDetail) ? stripHtmlTags(recallTypeManagerDetail as string) : undefined,
      },
      allOptions: formOptions.recallTypeManager,
    },
  }

  return {
    valuesToSave,
    nextPagePath: `${urlInfo.basePath}manager-record-decision-delius`,
    apiEndpointPathSuffix: 'manager-recall-decision',
  }
}
