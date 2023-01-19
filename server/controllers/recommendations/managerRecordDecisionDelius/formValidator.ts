import { EVENTS } from '../../../utils/constants'
import { isValueValid } from '../formOptions/formOptions'
import { makeErrorObject } from '../../../utils/errors'
import { strings } from '../../../textStrings/en'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const validateManagerRecordDecisionDelius = async ({
  urlInfo,
  requestBody,
}: FormValidatorArgs): FormValidatorReturn => {
  const { managerRecallDecision } = requestBody
  const invalidRecallType = !isValueValid(managerRecallDecision as string, 'recallTypeManager')
  if (!managerRecallDecision || invalidRecallType) {
    const errorId = 'noManagerRecallTypeSelected'
    const errors = [
      makeErrorObject({
        id: 'managerRecallDecision',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
    return {
      errors,
    }
  }
  return {
    valuesToSave: {
      managerRecallDecision: {
        isSentToDelius: true,
      },
    },
    nextPagePath: `${urlInfo.basePath}manager-decision-confirmation`,
    apiEndpointPathSuffix: 'manager-recall-decision',
    monitoringEvent: {
      eventName: EVENTS.MRD_MANAGER_DECISION_RECORDED_IN_DELIUS,
      data: {
        managerRecallDecision,
      },
    },
  }
}
