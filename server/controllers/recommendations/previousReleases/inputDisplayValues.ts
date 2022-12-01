import { InputDisplayValuesArgs } from '../../../@types'
import { getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'

export const inputDisplayValuesPreviousReleases = ({ errors = {}, apiValues }: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: '',
  }
  if (!isDefined(errors.hasBeenReleasedPreviously)) {
    inputDisplayValues.value = getProperty<RecommendationResponse, string>(
      apiValues,
      'previousReleases.hasBeenReleasedPreviously'
    )
  }
  return inputDisplayValues
}
