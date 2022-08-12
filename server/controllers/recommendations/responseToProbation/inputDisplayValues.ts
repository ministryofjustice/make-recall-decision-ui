import { InputDisplayValuesArgs } from '../../../@types'
import { getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'

export const inputDisplayValuesResponseToProbation = ({ errors = {}, apiValues }: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: '',
  }
  if (!isDefined(errors.responseToProbation)) {
    inputDisplayValues.value = getProperty<RecommendationResponse, string>(apiValues, 'responseToProbation')
  }
  return inputDisplayValues
}
