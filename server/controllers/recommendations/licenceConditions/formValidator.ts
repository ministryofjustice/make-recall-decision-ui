import { FormValidatorArgs, FormValidatorReturn } from '../../../@types'
import { makeErrorObject } from '../../../utils/errors'
import { formOptions, isValueValid } from '../helpers/formOptions'
import { strings } from '../../../textStrings/en'
import { cleanseUiList } from '../../../utils/lists'
import { isCaseRestrictedOrExcluded, isDefined } from '../../../utils/utils'
import { fetchAndTransformLicenceConditions } from './transform'
import { TransformedLicenceConditionsResponse } from '../../caseSummary/licenceConditions/transformLicenceConditions'
import { nextPageLinkUrl } from '../helpers/urls'

const makeArray = (item: unknown) => (Array.isArray(item) ? item : [item])

export const validateLicenceConditionsBreached = async ({
  requestBody,
  urlInfo,
  token,
}: FormValidatorArgs): FormValidatorReturn => {
  const { licenceConditionsBreached, crn } = requestBody
  const noneSelected = !isDefined(licenceConditionsBreached)
  let invalidStandard
  let allSelectedConditions
  let selectedStandardConditions
  let errors
  let errorId

  if (!noneSelected) {
    allSelectedConditions = makeArray(licenceConditionsBreached)
    selectedStandardConditions = allSelectedConditions
      .filter(item => item.startsWith('standard|'))
      .map(item => item.replace('standard|', ''))
    invalidStandard = selectedStandardConditions.some(id => !isValueValid(id, 'standardLicenceConditions'))
  }

  if (noneSelected || invalidStandard) {
    errorId = 'noLicenceConditionsSelected'
    errors = [
      makeErrorObject({
        id: 'licenceConditionsBreached',
        text: strings.errors[errorId],
        errorId,
      }),
    ]
  }

  // additional
  errorId = null
  const selectedAdditionalLicenceConditions =
    !noneSelected &&
    allSelectedConditions.filter(item => item.startsWith('additional|')).map(item => item.replace('additional|', ''))
  let allAdditionalLicenceConditions
  if (selectedAdditionalLicenceConditions.length) {
    const caseSummary = await fetchAndTransformLicenceConditions({
      crn: crn as string,
      token,
    })
    const { convictions } = caseSummary as TransformedLicenceConditionsResponse
    if (isCaseRestrictedOrExcluded(caseSummary.userAccessResponse)) {
      errorId = 'excludedRestrictedCrn'
    } else if (convictions.hasMultipleActiveCustodial) {
      errorId = 'hasMultipleActiveCustodial'
    } else if (!convictions.activeCustodial[0]) {
      errorId = 'noActiveCustodial'
    }

    if (errorId) {
      errors = errors || []
      errors.push(
        makeErrorObject({
          id: 'licenceConditionsBreached',
          text: strings.errors[errorId],
          errorId,
        })
      )
    } else {
      const conviction = convictions.activeCustodial[0]
      allAdditionalLicenceConditions = conviction.licenceConditions.map(condition => {
        return {
          mainCatCode: condition.licenceConditionTypeMainCat.code,
          subCatCode: condition.licenceConditionTypeSubCat.code,
          title: condition.licenceConditionTypeMainCat.description,
          details: condition.licenceConditionTypeSubCat.description,
          note: condition.licenceConditionNotes,
        }
      })
    }
  }

  if (errors) {
    return {
      errors,
    }
  }

  const valuesToSave = {
    licenceConditionsBreached: {
      standardLicenceConditions: {
        selected: selectedStandardConditions,
        allOptions: cleanseUiList(formOptions.standardLicenceConditions),
      },
      additionalLicenceConditions: {
        selected: selectedAdditionalLicenceConditions,
        allOptions: allAdditionalLicenceConditions,
      },
    },
  }
  const nextPagePath = nextPageLinkUrl({ nextPageId: 'alternatives-tried', urlInfo })
  return {
    valuesToSave,
    nextPagePath,
  }
}
