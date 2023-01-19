import { booleanToYesNo, getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { InputDisplayValuesArgs } from '../../../@types/pagesForms'

export const inputDisplayValuesIsExtendedSentence = ({ errors = {}, apiValues }: InputDisplayValuesArgs) => {
  if (!isDefined(errors.isExtendedSentence)) {
    const apiValue = getProperty<RecommendationResponse, boolean>(apiValues, 'isExtendedSentence')
    return { value: booleanToYesNo(apiValue) }
  }
  return { value: '' }
}
