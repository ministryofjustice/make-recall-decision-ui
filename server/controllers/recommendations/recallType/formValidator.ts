import { makeErrorObject } from '../../../utils/errors'
import { isValueValid } from '../formOptions/formOptions'
import strings from '../../../textStrings/en'
import { isEmptyStringOrWhitespace, isString, stripHtmlTags } from '../../../utils/utils'
import EVENTS from '../../../utils/constants'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'
import bindPlaceholderValues from '../../../utils/automatedFieldValues/binding'
import { availableRecallTypes, availableRecallTypesFTR56 } from './availableRecallTypes'

const validateRecallType = async ({
  requestBody,
  urlInfo,
  flagFTR56Enabled,
}: FormValidatorArgs & {
  flagFTR56Enabled: boolean
}): FormValidatorReturn => {
  const { recallType, originalRecallType, ftrMandatory, standardMandatory, personOnProbationName } = requestBody
  const ftrMandatoryResolved = ftrMandatory === 'true'
  const standardMandatoryResolved = standardMandatory === 'true'
  const invalidRecallType =
    !isValueValid(recallType as string, 'recallType') ||
    (ftrMandatoryResolved && recallType === 'STANDARD') ||
    (flagFTR56Enabled && standardMandatoryResolved && recallType === 'FIXED_TERM')

  const isFixedTerm = recallType === 'FIXED_TERM'
  const isStandard = recallType === 'STANDARD'
  const isChanged = recallType !== originalRecallType

  const mandatoryFTRRationale = flagFTR56Enabled
    ? strings.automatedFieldValues.mandatoryFTRRationaleFTR56
    : strings.automatedFieldValues.mandatoryFTRRationale
  const recallTypeDetailsFixedTerm =
    ftrMandatoryResolved && isFixedTerm
      ? bindPlaceholderValues(mandatoryFTRRationale, { personOnProbationName: personOnProbationName as string })
      : requestBody.recallTypeDetailsFixedTerm

  const recallTypeDetailsStandard =
    flagFTR56Enabled && standardMandatoryResolved && isStandard
      ? bindPlaceholderValues(strings.automatedFieldValues.mandatoryStandardRationaleFTR56, {
          personOnProbationName: personOnProbationName as string,
        })
      : requestBody.recallTypeDetailsStandard

  const isDiscretionary = !ftrMandatoryResolved && (!flagFTR56Enabled || !standardMandatoryResolved)
  const missingDetailFixedTerm = isDiscretionary && isFixedTerm && isEmptyStringOrWhitespace(recallTypeDetailsFixedTerm)
  const missingDetailStandard = isDiscretionary && isStandard && isEmptyStringOrWhitespace(recallTypeDetailsStandard)

  const isFromTaskList = urlInfo.fromPageId === 'task-list'
  const hasError = !recallType || invalidRecallType || missingDetailFixedTerm || missingDetailStandard
  if (hasError) {
    const errors = []
    let errorId
    if (!recallType || invalidRecallType) {
      if (flagFTR56Enabled) {
        errorId = 'noRecallTypeSelected'
      } else {
        errorId = ftrMandatoryResolved ? 'noRecallTypeSelectedMandatory' : 'noRecallTypeSelectedDiscretionary'
      }
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
      allOptions: flagFTR56Enabled
        ? availableRecallTypesFTR56(ftrMandatoryResolved, standardMandatoryResolved)
        : availableRecallTypes(ftrMandatoryResolved),
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
