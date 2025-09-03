import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { isFixedTermRecallMandatoryForRecommendation } from '../../../utils/fixedTermRecallUtils'
import { formOptions } from '../formOptions/formOptions'

export function availableRecallTypes(recommendation: RecommendationResponse): {
  value: string
  text: string
}[] {
  return isFixedTermRecallMandatoryForRecommendation(recommendation)
    ? formOptions.recallType.filter(recallType => ['FIXED_TERM', 'NO_RECALL'].includes(recallType.value))
    : formOptions.recallType
}
