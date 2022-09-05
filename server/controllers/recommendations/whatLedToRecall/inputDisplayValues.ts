import { InputDisplayValuesArgs } from '../../../@types'
import { getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'

export const inputDisplayValuesWhatLedToRecall = ({ errors = {}, apiValues }: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: '',
  }
  if (!isDefined(errors.whatLedToRecall)) {
    inputDisplayValues.value = getProperty<RecommendationResponse, string>(apiValues, 'whatLedToRecall')
  }
  return inputDisplayValues
}
