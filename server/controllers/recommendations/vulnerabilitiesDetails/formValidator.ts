import { cleanseUiList } from '../../../utils/lists'
import { formOptions, optionTextFromValue } from '../formOptions/formOptions'
import { FormValidatorArgs, FormValidatorReturn, NamedFormError } from '../../../@types/pagesForms'
import { isEmptyStringOrWhitespace, isString, stripHtmlTags } from '../../../utils/utils'
import { makeErrorObject } from '../../../utils/errors'
import { strings } from '../../../textStrings/en'

export const validateVulnerabilitiesDetails = async ({ requestBody }: FormValidatorArgs): FormValidatorReturn => {
  const { selectedVulnerabilities } = requestBody
  const selectedVulnerabilitiesList = Array.isArray(selectedVulnerabilities)
    ? selectedVulnerabilities
    : [selectedVulnerabilities]

  const missingDetails = selectedVulnerabilitiesList.filter(id => {
    if (isEmptyStringOrWhitespace(requestBody[`vulnerabilitiesDetails-${id}`])) {
      return id
    }
    return false
  })

  // error
  if (missingDetails.length) {
    const errors: NamedFormError[] = []
    missingDetails.forEach(id => {
      errors.push(
        makeErrorObject({
          id: `vulnerabilitiesDetails-${id}`,
          text: `${strings.errors.missingDetail} for ${optionTextFromValue(id, 'vulnerabilities').toLowerCase()}`,
          errorId: 'missingVulnerabilitiesDetails',
        })
      )
    })

    const unsavedValues = {
      vulnerabilities: selectedVulnerabilitiesList.map(id => ({
        value: id,
        details: requestBody[`vulnerabilitiesDetails-${id}`],
      })),
    }

    return {
      errors,
      unsavedValues,
    }
  }

  const valuesToSave = {
    vulnerabilities: {
      selected: selectedVulnerabilitiesList.map(id => {
        const details = requestBody[`vulnerabilitiesDetails-${id}`]
        return {
          value: id,
          details: isString(details) ? stripHtmlTags(details as string) : undefined,
        }
      }),
      allOptions: cleanseUiList(formOptions.vulnerabilities),
    },
  }

  // valid
  return {
    valuesToSave,
  }
}
