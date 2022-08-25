import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { formOptions, isValueValid } from '../helpers/formOptions'
import { strings } from '../../../textStrings/en'

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
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/victim-contact-scheme`
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
