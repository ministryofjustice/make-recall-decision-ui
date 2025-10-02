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

  const exclusiveList = ['NONE_OR_NOT_KNOWN', 'NONE', 'NOT_KNOWN']

  const hasNoneOrNotKnown = vulnerabilitiesList.includes('NONE_OR_NOT_KNOWN')
  const hasNone = vulnerabilitiesList.includes('NONE')
  const hasNotKnown = vulnerabilitiesList.includes('NOT_KNOWN')

  const missingExclusiveCheckboxSelection = (hasNone || hasNotKnown) && !hasNoneOrNotKnown
  const missingExclusiveRadioSelection = hasNoneOrNotKnown && !hasNone && !hasNotKnown
  const invalidExclusiveInput = missingExclusiveCheckboxSelection || missingExclusiveRadioSelection

  const hasExclusive = vulnerabilitiesList.some(item => exclusiveList.includes(item))
  const hasNormal = vulnerabilitiesList.some(item => !exclusiveList.includes(item))
  const hasNormalAndExclusiveInputs = hasExclusive && hasNormal

  const hasError = !vulnerabilities || missingDetails.length || invalidExclusiveInput || hasNormalAndExclusiveInputs

  if (hasError) {
    const errors = []
    let errorId

    if (!vulnerabilities || invalidVulnerability) {
      errorId = 'noVulnerabilitiesSelected'
      errors.push(
        makeErrorObject({
          id: 'RISK_OF_SUICIDE_OR_SELF_HARM',
          name: 'vulnerabilities',
          text: strings.errors[errorId],
          errorId,
        })
      )
    }

    if (hasNormalAndExclusiveInputs) {
      vulnerabilitiesList.forEach(id => {
        errorId = id
        errors.push(
          makeErrorObject({
            id,
            text: `${strings.errors.normalAndExclusiveSelected}`,
            errorId,
          })
        )
      })
    } else {
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

      if (invalidExclusiveInput) {
        errorId = 'NONE_OR_NOT_KNOWN'
        errors.push(
          makeErrorObject({
            id: `NONE_OR_NOT_KNOWN`,
            text: `${strings.errors.missingExclusive}`,
            errorId,
          })
        )
      }
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
