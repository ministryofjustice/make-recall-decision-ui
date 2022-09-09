import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { formOptions, isValueValid } from '../helpers/formOptions'
import { strings } from '../../../textStrings/en'
import { nextPageLinkUrl } from '../helpers/urls'

export const validateRecallType = async ({ requestBody, urlInfo }: FormValidatorArgs): FormValidatorReturn => {
  const { recallType, recallTypeDetailsFixedTerm, recallTypeDetailsStandard } = requestBody
  const invalidRecallType = !isValueValid(recallType as string, 'recallType')
  const missingDetailFixedTerm = recallType === 'FIXED_TERM' && !recallTypeDetailsFixedTerm
  const missingDetailStandard = recallType === 'STANDARD' && !recallTypeDetailsStandard
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
  if (recallType === 'FIXED_TERM') {
    recallTypeDetails = recallTypeDetailsFixedTerm
  } else if (recallType === 'STANDARD') {
    recallTypeDetails = recallTypeDetailsStandard
  }
  const valuesToSave = {
    recallType: {
      selected: {
        value: recallType,
        details: recallTypeDetails,
      },
      allOptions: formOptions.recallType,
    },
  }
  const nextPagePath =
    recallType === 'NO_RECALL'
      ? `${urlInfo.basePath}start-no-recall`
      : nextPageLinkUrl({ nextPageId: 'emergency-recall', urlInfo })
  return {
    valuesToSave,
    nextPagePath,
  }
}
