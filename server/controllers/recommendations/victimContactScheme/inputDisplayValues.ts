import { InputDisplayValuesArgs } from '../../../@types'
import { getProperty, isDefined } from '../../../utils/utils'
import { VictimContactScheme, RecommendationResponse } from '../../../@types/make-recall-decision-api'

export const inputDisplayValuesVictimContactScheme = ({ errors = {}, apiValues }: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: '',
  }
  if (!isDefined(errors.hasVictimsInContactScheme)) {
    inputDisplayValues.value = getProperty<RecommendationResponse, VictimContactScheme>(
      apiValues,
      'hasVictimsInContactScheme'
    )?.selected
  }
  return inputDisplayValues
}
