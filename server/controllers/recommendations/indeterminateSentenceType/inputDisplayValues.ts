import { InputDisplayValuesArgs } from '../../../@types'
import { getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { IndeterminateSentenceType } from '../../../@types/make-recall-decision-api/models/IndeterminateSentenceType'

export const inputDisplayValuesIndeterminateSentenceType = ({ errors = {}, apiValues }: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: '',
  }
  if (!isDefined(errors.indeterminateSentenceType)) {
    inputDisplayValues.value = getProperty<RecommendationResponse, IndeterminateSentenceType>(
      apiValues,
      'indeterminateSentenceType'
    )?.selected
  }
  return inputDisplayValues
}
