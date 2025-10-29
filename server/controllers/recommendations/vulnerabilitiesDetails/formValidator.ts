import { cleanseUiList, findListItemByValue, ItemWithValue } from '../../../utils/lists'
import { FormOption, formOptions, optionTextFromValue } from '../formOptions/formOptions'
import { FormValidatorArgs, FormValidatorReturn, NamedFormError, UiFormOption } from '../../../@types/pagesForms'
import { isEmptyStringOrWhitespace, isString, stripHtmlTags } from '../../../utils/utils'
import { makeErrorObject } from '../../../utils/errors'
import { strings } from '../../../textStrings/en'
import { VULNERABILITY } from '../vulnerabilities/formOptions'

interface FormOptionWithOptionalSubValues extends FormOption {
  items?: ItemWithValue[]
}

const findListItemBySubValue = (items: FormOptionWithOptionalSubValues[], subValue: string) =>
  items.find(item => (item.items ? findListItemByValue<ItemWithValue>({ items: item.items, value: subValue }) : false))

export const vulnerabilityRequiresDetails = (id: VULNERABILITY) => {
  const vulnerabilityItem =
    findListItemByValue<UiFormOption>({
      items: formOptions.vulnerabilitiesRiskToSelf,
      value: id,
    }) || findListItemBySubValue(formOptions.vulnerabilitiesRiskToSelf, id)
  return Boolean(vulnerabilityItem?.detailsLabel)
}

export const validateVulnerabilitiesDetails = async ({ requestBody }: FormValidatorArgs): FormValidatorReturn => {
  const { selectedVulnerabilities } = requestBody
  const selectedVulnerabilitiesList = Array.isArray(selectedVulnerabilities)
    ? (selectedVulnerabilities as VULNERABILITY[])
    : [selectedVulnerabilities as VULNERABILITY]

  const missingDetails = selectedVulnerabilitiesList.filter((id: VULNERABILITY) => {
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
          text: `${strings.errors.missingDetail} for ${optionTextFromValue(id.toString(), 'vulnerabilities').toLowerCase()}`,
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
