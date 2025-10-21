import { makeErrorObject } from '../../../utils/errors'
import { routeUrls } from '../../../routes/routeUrls'
import { formOptions, isValueValid, optionTextFromValue } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'
import { cleanseUiList, findListItemByValue } from '../../../utils/lists'
import { isEmptyStringOrWhitespace, isString, stripHtmlTags } from '../../../utils/utils'
import { FormValidatorArgs, FormValidatorReturn, UiFormOption } from '../../../@types/pagesForms'
import { VULNERABILITY } from './formOptions'

export const validateVulnerabilitiesRiskToSelf = async ({
  requestBody,
  recommendationId,
}: FormValidatorArgs): FormValidatorReturn => {
  const { vulnerabilities } = requestBody
  let vulnerabilitiesList: VULNERABILITY[] = []
  if (Array.isArray(vulnerabilities)) {
    vulnerabilitiesList = vulnerabilities as VULNERABILITY[]
  } else if (vulnerabilities) {
    vulnerabilitiesList = [vulnerabilities as VULNERABILITY]
  }

  const exclusiveList = [VULNERABILITY.NONE_OR_NOT_KNOWN, VULNERABILITY.NONE, VULNERABILITY.NOT_KNOWN]

  // Keep NONE/NOT_KNOWN only if parent NONE_OR_NOT_KNOWN selected
  const hasParentNoneOrNotKnown = vulnerabilitiesList.includes(VULNERABILITY.NONE_OR_NOT_KNOWN)
  if (!hasParentNoneOrNotKnown) {
    vulnerabilitiesList = vulnerabilitiesList.filter(v => ![VULNERABILITY.NONE, VULNERABILITY.NOT_KNOWN].includes(v))
  }

  // Validation: any invalid vulnerability values
  const invalidVulnerability = vulnerabilitiesList
    .filter(v => !exclusiveList.includes(v))
    .some(id => !isValueValid(id as string, 'vulnerabilitiesRiskToSelf'))

  const hasNoneOrNotKnown = vulnerabilitiesList.includes(VULNERABILITY.NONE_OR_NOT_KNOWN)
  const hasNone = vulnerabilitiesList.includes(VULNERABILITY.NONE)
  const hasNotKnown = vulnerabilitiesList.includes(VULNERABILITY.NOT_KNOWN)

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
          id: formOptions.vulnerabilitiesRiskToSelf[0].value, // so the error shows on the first field on the screen
          name: 'vulnerabilities',
          text: strings.errors.noVulnerabilitiesSelectedRiskToSelf,
          errorId: 'noVulnerabilitiesSelected',
        })
      )
    }

    if (hasNormalAndExclusiveInputs) {
      ;[...normalVulnerabilities, VULNERABILITY.NONE_OR_NOT_KNOWN].forEach(id => {
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
          id: VULNERABILITY.NONE_OR_NOT_KNOWN,
          text: strings.errors.missingExclusive,
          errorId: VULNERABILITY.NONE_OR_NOT_KNOWN,
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
