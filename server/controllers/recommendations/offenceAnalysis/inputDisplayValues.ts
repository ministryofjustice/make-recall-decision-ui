import { getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { InputDisplayValuesArgs } from '../../../@types/pagesForms'

export const inputDisplayValuesOffenceAnalysis = ({ errors = {}, apiValues }: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: '',
  }
  if (!isDefined(errors.offenceAnalysis)) {
    inputDisplayValues.value = getProperty<RecommendationResponse, string>(apiValues, 'offenceAnalysis')
  }
  return inputDisplayValues
}
