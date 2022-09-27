import { FormOption, FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { formOptions, isValueValid, optionTextFromValue } from '../helpers/formOptions'
import { strings } from '../../../textStrings/en'
import { cleanseUiList, findListItemByValue } from '../../../utils/lists'
import { isEmptyStringOrWhitespace } from '../../../utils/utils'

export const validateVulnerabilities = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  const { vulnerabilities } = requestBody
  const vulnerabilitiesList = Array.isArray(vulnerabilities) ? vulnerabilities : [vulnerabilities]
  const invalidVulnerability = vulnerabilitiesList.some(id => !isValueValid(id, 'vulnerabilities'))
  const missingDetails = vulnerabilitiesList.filter(id => {
    const optionShouldHaveDetails = Boolean(
      findListItemByValue<FormOption>({
        items: formOptions.vulnerabilities,
        value: id,
      })?.detailsLabel
    )
    if (optionShouldHaveDetails && isEmptyStringOrWhitespace(requestBody[`vulnerabilitiesDetail-${id}`])) {
      return id
    }
    return false
  })
  const hasError = !vulnerabilities || missingDetails.length
  if (hasError) {
    const errors = []
    let errorId
    if (!vulnerabilities || invalidVulnerability) {
      errorId = 'noVulnerabilitiesSelected'
      errors.push(
        makeErrorObject({
          id: 'vulnerabilities',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }
    if (missingDetails.length) {
      missingDetails.forEach(id => {
        errorId = 'missingVulnerabilitiesDetail'
        errors.push(
          makeErrorObject({
            id: `vulnerabilitiesDetail-${id}`,
            text: `${strings.errors.missingDetail} for ${optionTextFromValue(id, 'vulnerabilities').toLowerCase()}`,
            errorId,
          })
        )
      })
    }
    const unsavedValues = {
      vulnerabilities: vulnerabilitiesList.map(id => ({
        value: id,
        details: requestBody[`vulnerabilitiesDetail-${id}`],
      })),
    }
    return {
      errors,
      unsavedValues,
    }
  }

  // valid
  const valuesToSave = {
    vulnerabilities: {
      selected: vulnerabilitiesList.map(alternative => ({
        value: alternative,
        details: requestBody[`vulnerabilitiesDetail-${alternative}`],
      })),
      allOptions: cleanseUiList(formOptions.vulnerabilities),
    },
  }
  return {
    valuesToSave,
    nextPagePath: `${routeUrls.recommendations}/${recommendationId}/task-list#heading-vulnerability`,
  }
}
