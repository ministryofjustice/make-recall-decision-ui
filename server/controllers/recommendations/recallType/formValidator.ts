import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { formOptions, isValueValid } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'
import { isEmptyStringOrWhitespace, isString, stripHtmlTags } from '../../../utils/utils'

export const validateRecallType = async ({ requestBody, urlInfo }: FormValidatorArgs): FormValidatorReturn => {
  const { recallType, recallTypeDetailsFixedTerm, recallTypeDetailsStandard } = requestBody
  const invalidRecallType = !isValueValid(recallType as string, 'recallType')
  const isFixedTerm = recallType === 'FIXED_TERM'
  const isStandard = recallType === 'STANDARD'
  const missingDetailFixedTerm = isFixedTerm && isEmptyStringOrWhitespace(recallTypeDetailsFixedTerm)
  const missingDetailStandard = isStandard && !recallTypeDetailsStandard
  const hasError = !recallType || invalidRecallType || missingDetailFixedTerm || missingDetailStandard
  if (hasError) {
    const errors = []
    let errorId
    if (!recallType || invalidRecallType) {
      errorId = 'noRecallTypeSelected'
      errors.push(
        makeErrorObject({
          id: 'recallType',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
    if (missingDetailFixedTerm || missingDetailStandard) {
      errorId = 'missingRecallTypeDetail'
      errors.push(
        makeErrorObject({
          id: missingDetailFixedTerm ? 'recallTypeDetailsFixedTerm' : 'recallTypeDetailsStandard',
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
  let recallTypeDetails
  if (isFixedTerm) {
    recallTypeDetails = recallTypeDetailsFixedTerm
  } else if (isStandard) {
    recallTypeDetails = recallTypeDetailsStandard
  }
  const valuesToSave = {
    recallType: {
      selected: {
        value: recallType,
        details: isString(recallTypeDetails) ? stripHtmlTags(recallTypeDetails as string) : undefined,
      },
      allOptions: formOptions.recallType,
    },
    isThisAnEmergencyRecall: isFixedTerm ? false : null,
  }
  // ignore any 'from page', whatever the user selects they'll continue through the flow
  const nextPageId = recallType === 'NO_RECALL' ? 'task-list-no-recall' : 'emergency-recall'
  return {
    valuesToSave,
    nextPagePath: `${urlInfo.basePath}${nextPageId}`,
  }
}
