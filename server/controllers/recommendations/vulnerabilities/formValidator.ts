import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { formOptions, isValueValid, optionTextFromValue } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'
import { cleanseUiList, findListItemByValue } from '../../../utils/lists'
import { isEmptyStringOrWhitespace, isString, stripHtmlTags } from '../../../utils/utils'
import { UiFormOption, FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const validateVulnerabilities = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  const { vulnerabilities } = requestBody
  const vulnerabilitiesList = Array.isArray(vulnerabilities) ? vulnerabilities : [vulnerabilities]
  const invalidVulnerability = vulnerabilitiesList.some(id => !isValueValid(id, 'vulnerabilities'))
  const missingDetails = vulnerabilitiesList.filter(id => {
    const optionShouldHaveDetails = Boolean(
      findListItemByValue<UiFormOption>({
        items: formOptions.vulnerabilities,
        value: id,
      })?.detailsLabel
    )
    if (optionShouldHaveDetails && isEmptyStringOrWhitespace(requestBody[`vulnerabilitiesDetail-${id}`])) {
      return id
    }
    return false
  })

  const missingExclusiveAnswers = vulnerabilities === 'NONE_OR_NOT_KNOWN'

  const hasError = !vulnerabilities || missingDetails.length || missingExclusiveAnswers
  if (hasError) {
    const errors = []
    let errorId
    if (!vulnerabilities || invalidVulnerability) {
      errorId = 'noVulnerabilitiesSelected'
      errors.push(
        makeErrorObject({
          id: 'option-1',
          name: 'vulnerabilities',
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
    if (missingExclusiveAnswers) {
      errorId = 'vulnerabilities-exclusive'
      errors.push(
        makeErrorObject({
          id: `exclusive-1`,
          name: 'vulnerabilities-exclusive',
          text: `${strings.errors.missingExclusive}`,
          errorId,
        })
      )
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
      selected: vulnerabilitiesList.map(alternative => {
        const details = requestBody[`vulnerabilitiesDetail-${alternative}`]
        return {
          value: alternative,
          details: isString(details) ? stripHtmlTags(details as string) : undefined,
        }
      }),
      allOptions: cleanseUiList(formOptions.vulnerabilities),
    },
  }
  return {
    valuesToSave,
    nextPagePath: `${routeUrls.recommendations}/${recommendationId}/task-list#heading-vulnerability`,
  }
}
