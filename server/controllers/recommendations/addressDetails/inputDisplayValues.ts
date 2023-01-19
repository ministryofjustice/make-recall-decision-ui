import { booleanToYesNo, getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { InputDisplayValuesArgs, ValueWithDetails } from '../../../@types/pagesForms'

export const inputDisplayValuesAddress = ({ errors = {}, unsavedValues = {}, apiValues }: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: undefined,
    details: '',
  } as ValueWithDetails
  if (!isDefined(errors.isMainAddressWherePersonCanBeFound)) {
    const apiValue = getProperty<RecommendationResponse, boolean>(
      apiValues,
      'isMainAddressWherePersonCanBeFound.selected'
    )
    inputDisplayValues.value = (unsavedValues.isMainAddressWherePersonCanBeFound as string) || booleanToYesNo(apiValue)

    if (!isDefined(errors.isMainAddressWherePersonCanBeFoundDetailsNo)) {
      inputDisplayValues.details = getProperty<RecommendationResponse, string>(
        apiValues,
        'isMainAddressWherePersonCanBeFound.details'
      ) as string
    }
  }
  return inputDisplayValues
}
