import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { formOptions, isValueValid } from '../helpers/formOptions'
import { strings } from '../../../textStrings/en'

export const validateVictimContactScheme = ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  let errors
  let valuesToSave
  let nextPagePath

  const { hasVictimsInContactScheme } = requestBody
  if (!hasVictimsInContactScheme || !isValueValid(hasVictimsInContactScheme, 'hasVictimsInContactScheme')) {
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
    }
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/victim-liaison-officer`
  }
  return {
    errors,
    valuesToSave,
    nextPagePath,
  }
}
