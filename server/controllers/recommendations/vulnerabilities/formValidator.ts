import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { formOptions, isValueValid, optionTextFromValue } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'
import { cleanseUiList, findListItemByValue } from '../../../utils/lists'
import { isEmptyStringOrWhitespace, isString, stripHtmlTags } from '../../../utils/utils'
import { UiFormOption, FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'

export const validateVulnerabilitiesRiskToSelf = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  const { vulnerabilities } = requestBody
  let vulnerabilitiesList: string[] = []
  if (Array.isArray(vulnerabilities)) {
    vulnerabilitiesList = vulnerabilities
  } else if (vulnerabilities) {
    vulnerabilitiesList = [vulnerabilities]
  }

  const exclusiveList = ['NONE_OR_NOT_KNOWN', 'NONE', 'NOT_KNOWN']

  // Keep NONE/NOT_KNOWN only if parent NONE_OR_NOT_KNOWN selected
  const hasParentNoneOrNotKnown = vulnerabilitiesList.includes('NONE_OR_NOT_KNOWN')
  if (!hasParentNoneOrNotKnown) {
    vulnerabilitiesList = vulnerabilitiesList.filter(v => !['NONE', 'NOT_KNOWN'].includes(v))
  }

  // Validation: any invalid vulnerability values
  const invalidVulnerability = vulnerabilitiesList
    .filter(v => !exclusiveList.includes(v))
    .some(id => !isValueValid(id, 'vulnerabilitiesRiskToSelf'))

  const hasNoneOrNotKnown = vulnerabilitiesList.includes('NONE_OR_NOT_KNOWN')
  const hasNone = vulnerabilitiesList.includes('NONE')
  const hasNotKnown = vulnerabilitiesList.includes('NOT_KNOWN')

  const missingExclusiveRadioSelection = hasNoneOrNotKnown && !hasNone && !hasNotKnown
  const hasExclusive = vulnerabilitiesList.some(v => exclusiveList.includes(v))
  const hasNormal = vulnerabilitiesList.some(v => !exclusiveList.includes(v))
  const hasNormalAndExclusiveInputs = hasExclusive && hasNormal

  const normalVulnerabilities = vulnerabilitiesList.filter(v => !exclusiveList.includes(v))

  const noVulnerabilities = vulnerabilitiesList.length === 0 || invalidVulnerability
  const hasError = noVulnerabilities || missingExclusiveRadioSelection || hasNormalAndExclusiveInputs

  if (hasError) {
    const errors = []

    if (noVulnerabilities) {
      errors.push(
        makeErrorObject({
          id: 'RISK_OF_SUICIDE_OR_SELF_HARM',
          name: 'vulnerabilities',
          text: strings.errors.noVulnerabilitiesSelectedRiskToSelf,
          errorId: 'noVulnerabilitiesSelected',
        })
      )
    }

    if (hasNormalAndExclusiveInputs) {
      ;[...normalVulnerabilities, 'NONE_OR_NOT_KNOWN'].forEach(id => {
        errors.push(
          makeErrorObject({
            id,
            text: strings.errors.normalAndExclusiveSelected,
            errorId: id,
          })
        )
      })
    } else if (missingExclusiveRadioSelection) {
      errors.push(
        makeErrorObject({
          id: 'NONE_OR_NOT_KNOWN',
          text: strings.errors.missingExclusive,
          errorId: 'NONE_OR_NOT_KNOWN',
        })
      )
    }

    const unsavedValues = {
      vulnerabilities: vulnerabilitiesList.map(id => ({
        value: id,
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
      selected: vulnerabilitiesList
        // prevent NONE_OR_NOT_KNOWN from being persisted to the database
        .filter(val => val !== 'NONE_OR_NOT_KNOWN')
        .map(alternative => {
          const details = requestBody[`vulnerabilitiesDetails-${alternative}`]
          return {
            value: alternative,
            details: isString(details) ? stripHtmlTags(details as string) : undefined,
          }
        }),
      allOptions: cleanseUiList(formOptions.vulnerabilitiesRiskToSelf),
    },
  }
  return {
    valuesToSave,
    nextPagePath: `${routeUrls.recommendations}/${recommendationId}/task-list#heading-vulnerability`,
  }
}

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
