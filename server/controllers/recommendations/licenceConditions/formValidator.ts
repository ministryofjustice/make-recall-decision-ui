import { makeErrorObject } from '../../../utils/errors'
import { formOptions, isValueValid } from '../formOptions/formOptions'
import { strings } from '../../../textStrings/en'
import { cleanseUiList } from '../../../utils/lists'
import { isCaseRestrictedOrExcluded, isDefined } from '../../../utils/utils'
import { fetchAndTransformLicenceConditions } from './transform'
import { TransformedLicenceConditionsResponse } from '../../caseSummary/licenceConditions/transformLicenceConditions'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { FormValidatorArgs, FormValidatorReturn, NamedFormError } from '../../../@types/pagesForms'

const makeArray = (item: unknown) => (Array.isArray(item) ? item : [item])

export const validateLicenceConditionsBreached = async ({
  requestBody,
  token,
}: FormValidatorArgs): FormValidatorReturn => {
  const { licenceConditionsBreached, crn, activeCustodialConvictionCount } = requestBody

  const errors: NamedFormError[] = []

  const activeCustodialConvictionCountAsNumber = Number(activeCustodialConvictionCount)
  if (Number.isNaN(activeCustodialConvictionCountAsNumber)) {
    errors.push(
      makeErrorObject({
        id: 'licenceConditionsBreached',
        text: strings.errors.invalidConvictionCount,
        errorId: 'invalidConvictionCount',
      })
    )
  }

  const allSelectedConditions = isDefined(licenceConditionsBreached) ? makeArray(licenceConditionsBreached) : []

  const selectedStandardConditions = allSelectedConditions
    .filter(item => item.startsWith('standard|'))
    .map(item => item.replace('standard|', ''))

  const selectedAdditionalLicenceConditions = allSelectedConditions
    .filter(item => item.startsWith('additional|'))
    .map(item => {
      const [, mainCatCode, subCatCode] = item.split('|')
      return { mainCatCode, subCatCode }
    })

  const invalidStandardCondition = selectedStandardConditions.some(id => !isValueValid(id, 'standardLicenceConditions'))

  if (
    activeCustodialConvictionCountAsNumber === 1 &&
    (allSelectedConditions.length === 0 || invalidStandardCondition)
  ) {
    errors.push(
      makeErrorObject({
        id: 'licenceConditionsBreached',
        text: strings.errors.noLicenceConditionsSelected,
        errorId: 'noLicenceConditionsSelected',
      })
    )
  }

  let allAdditionalLicenceConditions
  if (selectedAdditionalLicenceConditions.length) {
    const caseSummary = await fetchAndTransformLicenceConditions({
      crn: crn as string,
      token,
    })
    const { licenceConvictions } = caseSummary as TransformedLicenceConditionsResponse
    let errorId
    if (isCaseRestrictedOrExcluded(caseSummary.userAccessResponse)) {
      errorId = 'excludedRestrictedCrn'
    } else if (licenceConvictions.hasMultipleActiveCustodial) {
      errorId = 'hasMultipleActiveCustodial'
    } else if (!licenceConvictions.activeCustodial[0]) {
      errorId = 'noActiveCustodial'
    }

    if (errorId) {
      errors.push(
        makeErrorObject({
          id: 'licenceConditionsBreached',
          text: strings.errors[errorId],
          errorId,
        })
      )
    } else {
      const conviction = licenceConvictions.activeCustodial[0]
      allAdditionalLicenceConditions = conviction.licenceConditions.map(condition => {
        return {
          mainCatCode: condition.mainCategory.code,
          subCatCode: condition.subCategory.code,
          title: condition.mainCategory.description,
          details: condition.subCategory.description,
          note: condition.notes,
        }
      })
    }
  }

  if (errors.length > 0) {
    return {
      errors,
    }
  }

  const valuesToSave = {
    activeCustodialConvictionCount: activeCustodialConvictionCountAsNumber,
  } as RecommendationResponse
  if (selectedStandardConditions?.length) {
    valuesToSave.licenceConditionsBreached = {
      standardLicenceConditions: {
        selected: selectedStandardConditions,
        allOptions: cleanseUiList(formOptions.standardLicenceConditions),
      },
    }
  }
  if (selectedAdditionalLicenceConditions.length > 0) {
    valuesToSave.licenceConditionsBreached = valuesToSave.licenceConditionsBreached || {}
    valuesToSave.licenceConditionsBreached.additionalLicenceConditions = {
      selectedOptions: selectedAdditionalLicenceConditions,
      allOptions: allAdditionalLicenceConditions,
    }
  }
  return { valuesToSave }
}
