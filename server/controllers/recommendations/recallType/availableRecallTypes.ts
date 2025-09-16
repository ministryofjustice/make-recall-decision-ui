import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { isFixedTermRecallMandatoryForRecommendation } from '../../../utils/fixedTermRecallUtils'
import { FormOption, formOptions } from '../formOptions/formOptions'

export function availableRecallTypes(isFtrMandatory: boolean): FormOption[] {
  return isFtrMandatory
    ? formOptions.recallType.filter(recallType => ['FIXED_TERM', 'NO_RECALL'].includes(recallType.value))
    : formOptions.recallType
}

export function availableRecallTypesForRecommendation(recommendation: RecommendationResponse): FormOption[] {
  return availableRecallTypes(isFixedTermRecallMandatoryForRecommendation(recommendation))
}
