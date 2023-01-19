import { booleanToYesNo, getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { InputDisplayValuesArgs } from '../../../@types/pagesForms'

export const inputDisplayValuesIsIndeterminateSentence = ({ errors = {}, apiValues }: InputDisplayValuesArgs) => {
  if (!isDefined(errors.isIndeterminateSentence)) {
    const apiValue = getProperty<RecommendationResponse, boolean>(apiValues, 'isIndeterminateSentence')
    return { value: booleanToYesNo(apiValue) }
  }
  return { value: '' }
}
