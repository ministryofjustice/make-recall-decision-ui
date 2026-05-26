import { makeErrorObject } from '../../../utils/errors'
import { isValueValid } from '../formOptions/formOptions'
import strings from '../../../textStrings/en'
import { isEmptyStringOrWhitespace, isString, stripHtmlTags } from '../../../utils/utils'
import EVENTS from '../../../utils/constants'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'
import bindPlaceholderValues from '../../../utils/automatedFieldValues/binding'
import { availableRecallTypes } from './availableRecallTypes'

const validateRecallType = async ({ requestBody, urlInfo }: FormValidatorArgs): FormValidatorReturn => {
  const { recallType, originalRecallType, ftrMandatory, standardMandatory, personOnProbationName } = requestBody
  const ftrMandatoryResolved = ftrMandatory === 'true'
  const standardMandatoryResolved = standardMandatory === 'true'
  const invalidRecallType =
    !isValueValid(recallType as string, 'recallType') ||
    (ftrMandatoryResolved && recallType === 'STANDARD') ||
    (standardMandatoryResolved && recallType === 'FIXED_TERM')

  const isFixedTerm = recallType === 'FIXED_TERM'
  const isStandard = recallType === 'STANDARD'
  const isChanged = recallType !== originalRecallType

  const { mandatoryFTRRationale } = strings.automatedFieldValues
  const recallTypeDetailsFixedTerm =
    ftrMandatoryResolved && isFixedTerm
      ? bindPlaceholderValues(mandatoryFTRRationale, { personOnProbationName: personOnProbationName as string })
      : requestBody.recallTypeDetailsFixedTerm

  const recallTypeDetailsStandard =
    standardMandatoryResolved && isStandard
      ? bindPlaceholderValues(strings.automatedFieldValues.mandatoryStandardRationaleFTR56, {
          personOnProbationName: personOnProbationName as string,
        })
      : requestBody.recallTypeDetailsStandard

  const isDiscretionary = !ftrMandatoryResolved && !standardMandatoryResolved
  const missingDetailFixedTerm = isDiscretionary && isFixedTerm && isEmptyStringOrWhitespace(recallTypeDetailsFixedTerm)
  const missingDetailStandard = isDiscretionary && isStandard && isEmptyStringOrWhitespace(recallTypeDetailsStandard)

  const isFromTaskList = urlInfo.fromPageId === 'task-list'
  const hasError = !recallType || invalidRecallType || missingDetailFixedTerm || missingDetailStandard
  if (hasError) {
    const errors = []
    let errorId
    if (!recallType || invalidRecallType) {
      errorId = ftrMandatoryResolved ? 'noRecallTypeSelectedMandatory' : 'noRecallTypeSelectedDiscretionary'
      errors.push(
        makeErrorObject({
          id: 'recallType',
          text: strings.errors[errorId],
          errorId,
        }),
      )
    }
    if (missingDetailFixedTerm || missingDetailStandard) {
      errorId = 'missingRecallTypeDetail'
      errors.push(
        makeErrorObject({
          id: missingDetailFixedTerm ? 'recallTypeDetailsFixedTerm' : 'recallTypeDetailsStandard',
          text: strings.errors[errorId],
          errorId,
        }),
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
      allOptions: availableRecallTypes(ftrMandatoryResolved),
    },
    isThisAnEmergencyRecall: false,
  }
  if (isChanged) {
    if (isFixedTerm && !isFromTaskList) {
      valuesToSave.isThisAnEmergencyRecall = false
    } else {
      valuesToSave.isThisAnEmergencyRecall = null
    }
  } else {
    delete valuesToSave.isThisAnEmergencyRecall
  }

  // ignore any 'from page', whatever the user selects they'll continue through the flow
  const nextPageId = recallType === 'NO_RECALL' ? 'task-list-no-recall' : 'emergency-recall'

  return {
    valuesToSave,
    nextPagePath: `${urlInfo.basePath}${nextPageId}`,
    monitoringEvent: {
      eventName: EVENTS.MRD_RECALL_TYPE,
      data: {
        recallType,
      },
    },
  }
}

export default validateRecallType
