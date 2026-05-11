import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { isFixedTermRecallMandatoryForRecommendation } from '../../../utils/fixedTermRecallUtils'
import { FormOption, formOptions } from '../formOptions/formOptions'
import { SentenceGroup } from '../sentenceInformation/formOptions'

export function availableRecallTypes(isFtrMandatory: boolean): FormOption[] {
  return isFtrMandatory
    ? formOptions.recallType.filter(recallType => ['FIXED_TERM', 'NO_RECALL'].includes(recallType.value))
    : formOptions.recallType
}

export function availableRecallTypesForRecommendation(recommendation: RecommendationResponse): FormOption[] {
  return availableRecallTypes(isFixedTermRecallMandatoryForRecommendation(recommendation, false))
}

export function availableRecallTypesFTR56(isFtrMandatory: boolean, isStandardMandatory: boolean): FormOption[] {
  if (isFtrMandatory) {
    return formOptions.recallTypeFTR56.filter(recallType => ['FIXED_TERM', 'NO_RECALL'].includes(recallType.value))
  }

  if (isStandardMandatory) {
    return formOptions.recallTypeFTR56.filter(recallType => ['STANDARD', 'NO_RECALL'].includes(recallType.value))
  }

  return formOptions.recallTypeFTR56
}

export function availableRecallTypesForRecommendationFTR56(recommendation: RecommendationResponse): FormOption[] {
  const isFtrMandatory = isFixedTermRecallMandatoryForRecommendation(recommendation, true)

  return availableRecallTypesFTR56(
    isFtrMandatory,
    recommendation.sentenceGroup === SentenceGroup.ADULT_SDS && !isFtrMandatory,
  )
}
