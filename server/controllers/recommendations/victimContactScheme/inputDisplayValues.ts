import { getProperty, isDefined } from '../../../utils/utils'
import { VictimsInContactScheme, RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { InputDisplayValuesArgs } from '../../../@types/pagesForms'

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
