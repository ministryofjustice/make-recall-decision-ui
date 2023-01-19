import { booleanToYesNo, getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { InputDisplayValuesArgs, ValueWithDetails } from '../../../@types/pagesForms'

export const inputDisplayValuesFixedTermLicenceConditions = ({
  errors = {},
  unsavedValues = {},
  apiValues,
}: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: undefined,
    details: '',
  } as ValueWithDetails
  if (!isDefined(errors.hasFixedTermLicenceConditions)) {
    const apiValue = getProperty<RecommendationResponse, boolean>(
      apiValues,
      'fixedTermAdditionalLicenceConditions.selected'
    )
    inputDisplayValues.value = (unsavedValues.hasFixedTermLicenceConditions as string) || booleanToYesNo(apiValue)

    if (!isDefined(errors.hasFixedTermLicenceConditionsDetails)) {
      inputDisplayValues.details = getProperty<RecommendationResponse, string>(
        apiValues,
        'fixedTermAdditionalLicenceConditions.details'
      ) as string
    }
  }
  return inputDisplayValues
}
