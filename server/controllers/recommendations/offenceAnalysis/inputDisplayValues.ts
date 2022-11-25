import { InputDisplayValuesArgs } from '../../../@types'
import { getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'

export const inputDisplayValuesOffenceAnalysis = ({ errors = {}, apiValues }: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: '',
  }
  if (!isDefined(errors.offenceAnalysis)) {
    inputDisplayValues.value = getProperty<RecommendationResponse, string>(apiValues, 'offenceAnalysis')
  }
  return inputDisplayValues
}
