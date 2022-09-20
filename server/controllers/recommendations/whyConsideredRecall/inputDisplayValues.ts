import { InputDisplayValuesArgs } from '../../../@types'
import { getProperty, isDefined } from '../../../utils/utils'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { WhyConsideredRecall } from '../../../@types/make-recall-decision-api/models/WhyConsideredRecall'

export const inputDisplayValuesWhyConsideredRecall = ({ errors = {}, apiValues }: InputDisplayValuesArgs) => {
  const inputDisplayValues = {
    value: '',
  }
  if (!isDefined(errors.whyConsideredRecall)) {
    inputDisplayValues.value = getProperty<RecommendationResponse, WhyConsideredRecall>(
      apiValues,
      'whyConsideredRecall'
    )?.selected
  }
  return inputDisplayValues
}
