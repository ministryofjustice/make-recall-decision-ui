import { InputDisplayValuesArgs } from '../../../@types'
import { getProperty, isDefined } from '../../../utils/utils'
import { VictimsInContactScheme, RecommendationResponse } from '../../../@types/make-recall-decision-api'

export const inputDisplayValuesVictimContactScheme = ({ errors = {}, apiValues }: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: '',
  }
  if (!isDefined(errors.hasVictimsInContactScheme)) {
    inputDisplayValues.value = getProperty<RecommendationResponse, VictimsInContactScheme>(
      apiValues,
      'hasVictimsInContactScheme'
    )?.selected
  }
  return inputDisplayValues
}
