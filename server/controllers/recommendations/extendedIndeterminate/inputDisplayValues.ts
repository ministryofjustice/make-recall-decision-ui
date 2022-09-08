import { InputDisplayValuesArgs } from '../../../@types'
import { booleanToYesNo, getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'

export const inputDisplayValuesExtendedIndeterminate = ({ errors = {}, apiValues }: InputDisplayValuesArgs) => {
  if (!isDefined(errors.isExtendedOrIndeterminateSentence)) {
    const apiValue = getProperty<RecommendationResponse, boolean>(apiValues, 'isExtendedOrIndeterminateSentence')
    return { value: booleanToYesNo(apiValue) }
  }
  return { value: '' }
}
