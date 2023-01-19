import { booleanToYesNo, getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { InputDisplayValuesArgs, ValueWithDetails } from '../../../@types/pagesForms'

export const inputDisplayValuesContraband = ({
  errors = {},
  unsavedValues = {},
  apiValues,
}: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: undefined,
    details: '',
  } as ValueWithDetails
  if (!isDefined(errors.hasContrabandRisk)) {
    const apiValue = getProperty<RecommendationResponse, boolean>(apiValues, 'hasContrabandRisk.selected')
    inputDisplayValues.value = (unsavedValues.hasContrabandRisk as string) || booleanToYesNo(apiValue)

    if (!isDefined(errors.hasContrabandRiskDetailsYes)) {
      inputDisplayValues.details = getProperty<RecommendationResponse, string>(
        apiValues,
        'hasContrabandRisk.details'
      ) as string
    }
  }
  return inputDisplayValues
}
