import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'

export const validateManagerRecordDecisionDelius = async ({ urlInfo }: FormValidatorArgs): FormValidatorReturn => {
  return {
    valuesToSave: {
      managerRecallDecision: {
        isSentToDelius: true,
      },
    },
    nextPagePath: `${urlInfo.basePath}manager-decision-confirmation`,
    apiEndpointPathSuffix: 'manager-recall-decision',
  }
}
