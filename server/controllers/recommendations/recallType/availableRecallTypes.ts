import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { isFixedTermRecallMandatoryForRecommendation } from '../../../utils/fixedTermRecallUtils'
import { FormOption, formOptions } from '../formOptions/formOptions'
import { SentenceGroup } from '../sentenceInformation/formOptions'

export function availableRecallTypes(isFtrMandatory: boolean, isStandardMandatory: boolean): FormOption[] {
  if (isFtrMandatory) {
    return formOptions.recallType.filter(recallType => ['FIXED_TERM', 'NO_RECALL'].includes(recallType.value))
  }

  if (isStandardMandatory) {
    return formOptions.recallType.filter(recallType => ['STANDARD', 'NO_RECALL'].includes(recallType.value))
  }

  return formOptions.recallType
}

export function availableRecallTypesForRecommendation(recommendation: RecommendationResponse): FormOption[] {
  const isFtrMandatory = isFixedTermRecallMandatoryForRecommendation(recommendation)

  return availableRecallTypes(
    isFtrMandatory,
    recommendation.sentenceGroup === SentenceGroup.ADULT_SDS && !isFtrMandatory,
  )
}
