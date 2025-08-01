import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { formOptions } from '../formOptions/formOptions'

export function availableRecallTypes(
  ftr48Flag: boolean,
  recommendation: RecommendationResponse
): {
  value: string
  text: string
}[] {
  if (!ftr48Flag) {
    return formOptions.recallType
  }

  if (
    !recommendation.isUnder18 &&
    !recommendation.isSentence48MonthsOrOver &&
    !recommendation.isMappaCategory4 &&
    !recommendation.isMappaLevel2Or3 &&
    !recommendation.isRecalledOnNewChargedOffence &&
    !recommendation.isServingFTSentenceForTerroristOffence &&
    !recommendation.hasBeenChargedWithTerroristOrStateThreatOffence
  ) {
    return formOptions.recallType.filter(recallType => ['FIXED_TERM', 'NO_RECALL'].includes(recallType.value))
  }

  return formOptions.recallType
}
