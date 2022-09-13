import { InputDisplayValuesArgs } from '../../../@types'
import { booleanToYesNo, getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'

export const inputDisplayValuesIsDeterminateSentence = ({ errors = {}, apiValues }: InputDisplayValuesArgs) => {
  if (!isDefined(errors.isDeterminateSentence)) {
    const apiValue = getProperty<RecommendationResponse, boolean>(apiValues, 'isDeterminateSentence')
    return { value: booleanToYesNo(apiValue) }
  }
  return { value: '' }
}
