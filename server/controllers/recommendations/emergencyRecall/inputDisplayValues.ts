import { booleanToYesNo, getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { InputDisplayValuesArgs } from '../../../@types/pagesForms'

const inputDisplayValuesEmergencyRecall = ({ errors = {}, apiValues }: InputDisplayValuesArgs) => {
  if (!isDefined(errors.isThisAnEmergencyRecall)) {
    const apiValue = getProperty<RecommendationResponse, boolean>(apiValues, 'isThisAnEmergencyRecall')
    return { value: booleanToYesNo(apiValue) }
  }
  return { value: '' }
}

export default inputDisplayValuesEmergencyRecall
