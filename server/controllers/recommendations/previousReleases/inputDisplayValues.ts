import { InputDisplayValuesArgs } from '../../../@types'
import { booleanToYesNo, getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'

export const inputDisplayValuesPreviousReleases = ({ errors = {}, apiValues }: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: '',
  }
  if (!isDefined(errors.hasBeenReleasedPreviously)) {
    const apiValue = getProperty<RecommendationResponse, boolean>(
      apiValues,
      'previousReleases.hasBeenReleasedPreviously'
    )
    inputDisplayValues.value = booleanToYesNo(apiValue)
  }
  return inputDisplayValues
}
