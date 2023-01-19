import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { formOptions, isValueValid } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const validateVictimContactScheme = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const { hasVictimsInContactScheme } = requestBody
  if (!hasVictimsInContactScheme || !isValueValid(hasVictimsInContactScheme as string, 'hasVictimsInContactScheme')) {
    const errorId = 'noVictimContactSchemeSelected'
    errors = [
      makeErrorObject({
        id: 'hasVictimsInContactScheme',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
  }
  if (!errors) {
    valuesToSave = {
      hasVictimsInContactScheme: {
        selected: hasVictimsInContactScheme,
        allOptions: formOptions.hasVictimsInContactScheme,
      },
      dateVloInformed: hasVictimsInContactScheme !== 'YES' ? null : undefined,
    }
    const nextPageId =
      hasVictimsInContactScheme === 'YES' ? 'victim-liaison-officer' : 'task-list#heading-victim-liaison'
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/${nextPageId}`
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
