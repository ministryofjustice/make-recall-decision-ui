import { makeErrorObject } from '../../../utils/errors'
import { isValueValid } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'
import { nextPageLinkUrl } from '../helpers/urls'
import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const validateRosh = async ({ requestBody, urlInfo }: FormValidatorArgs): FormValidatorReturn => {
  const { riskToChildren, riskToPublic, riskToKnownAdult, riskToStaff, riskToPrisoners } = requestBody
  const errorSuffixes = {
    riskToChildren: 'children',
    riskToPublic: 'the public',
    riskToKnownAdult: 'a known adult',
    riskToStaff: 'staff',
    riskToPrisoners: 'prisoners',
  }
  const errors = ['riskToChildren', 'riskToPublic', 'riskToKnownAdult', 'riskToStaff', 'riskToPrisoners']
    .map(key => {
      if (!requestBody[key] || !isValueValid(requestBody[key] as string, 'roshLevels')) {
        const errorId = 'missingRosh'
        return makeErrorObject({
          id: key,
          text: `${strings.errors[errorId]} ${errorSuffixes[key]}`,
          errorId,
        })
      }
      return undefined
    })
    .filter(Boolean)

  if (errors.length) {
    return {
      errors,
      unsavedValues: { riskToChildren, riskToPublic, riskToKnownAdult, riskToStaff, riskToPrisoners },
    }
  }
  const valuesToSave = {
    currentRoshForPartA: {
      riskToChildren,
      riskToPublic,
      riskToKnownAdult,
      riskToStaff,
      riskToPrisoners,
    },
  }
  const nextPagePath = nextPageLinkUrl({ nextPageId: 'task-list#heading-risk-profile', urlInfo })

  return {
    valuesToSave,
    nextPagePath,
  }
}
