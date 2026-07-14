import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import {
  isFixedTermRecallMandatoryForRecommendation,
  isStandardRecallMandatoryForRecommendation,
} from '../../../utils/fixedTermRecallUtils'
import { FormOption, formOptions } from '../formOptions/formOptions'

export function availableRecallTypes(isFtrMandatory: boolean, isStandardMandatory: boolean): FormOption[] {
  if (isFtrMandatory) {
    return formOptions.recallType.filter(recallType => ['FIXED_TERM', 'NO_RECALL'].includes(recallType.value))
  }

  if (isStandardMandatory) {
    return formOptions.recallType.filter(recallType => ['STANDARD', 'NO_RECALL'].includes(recallType.value))
  }

  return formOptions.recallType
}

export function availableRecallTypesForRecommendation(
  recommendation: RecommendationResponse,
  ftr56SentenceConviction: boolean,
): FormOption[] {
  return availableRecallTypes(
    isFixedTermRecallMandatoryForRecommendation(recommendation, ftr56SentenceConviction),
    isStandardRecallMandatoryForRecommendation(recommendation, ftr56SentenceConviction),
  )
}
