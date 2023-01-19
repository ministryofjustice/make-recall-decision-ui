import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { formOptions, isValueValid } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const validateIntegratedOffenderManagement = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const { isUnderIntegratedOffenderManagement } = requestBody
  if (
    !isUnderIntegratedOffenderManagement ||
    !isValueValid(isUnderIntegratedOffenderManagement as string, 'isUnderIntegratedOffenderManagement')
  ) {
    const errorId = 'noIntegratedOffenderManagementSelected'
    errors = [
      makeErrorObject({
        id: 'isUnderIntegratedOffenderManagement',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
  }
  if (!errors) {
    valuesToSave = {
      isUnderIntegratedOffenderManagement: {
        selected: isUnderIntegratedOffenderManagement,
        allOptions: formOptions.isUnderIntegratedOffenderManagement,
      },
    }
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/task-list#heading-custody`
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
