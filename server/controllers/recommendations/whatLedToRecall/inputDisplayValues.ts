import { getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { InputDisplayValuesArgs } from '../../../@types/pagesForms'

export const inputDisplayValuesWhatLedToRecall = ({ errors = {}, apiValues }: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: '',
  }
  if (!isDefined(errors.whatLedToRecall)) {
    inputDisplayValues.value = getProperty<RecommendationResponse, string>(apiValues, 'whatLedToRecall')
  }
  return inputDisplayValues
}
