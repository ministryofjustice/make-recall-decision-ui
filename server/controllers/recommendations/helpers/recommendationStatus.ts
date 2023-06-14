import { RecommendationResponse } from '../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { RecallTypeSelectedValue } from '../../../@types/make-recall-decision-api/models/RecallTypeSelectedValue'
import logger from '../../../../logger'
import { RecommendationsListItem } from '../../../@types/make-recall-decision-api'
import { STATUSES } from '../../../middleware/recommendationStatusCheck'
import { isRecommendationsListItem } from '../../../@types/make-recall-decision-api/models/RecommendationsListItem'

export enum RecommendationStatus {
  CONSIDERING_RECALL = 'CONSIDERING_RECALL',
  RECOMMENDATION_STARTED = 'RECOMMENDATION_STARTED',
  MAKING_DECISION_TO_RECALL = 'MAKING_DECISION_TO_RECALL',
  MAKING_DECISION_NOT_TO_RECALL = 'MAKING_DECISION_NOT_TO_RECALL',
  DECIDED_TO_RECALL = 'DECIDED_TO_RECALL',
  DECIDED_NOT_TO_RECALL = 'DECIDED_NOT_TO_RECALL',
  UNKNOWN = 'UNKNOWN',
}

export const recommendationStatus = (
  recommendation: RecommendationResponse | RecommendationsListItem
): RecommendationStatus => {
  const { status, recallType } = recommendation
  const isRecall = [RecallTypeSelectedValue.value.STANDARD, RecallTypeSelectedValue.value.FIXED_TERM].includes(
    recallType?.selected?.value
  )
  const isNoRecall = recallType?.selected?.value === RecallTypeSelectedValue.value.NO_RECALL

  let isClosed = status === RecommendationResponse.status.DOCUMENT_DOWNLOADED
  if (isRecommendationsListItem(recommendation)) {
    isClosed = !!recommendation.statuses.find(s => s.name === STATUSES.PP_DOCUMENT_CREATED && s.active)
  }
  if (isClosed) {
    if (isNoRecall) {
      return RecommendationStatus.DECIDED_NOT_TO_RECALL
    }
    if (isRecall) {
      return RecommendationStatus.DECIDED_TO_RECALL
    }
  }
  if (status === RecommendationResponse.status.RECALL_CONSIDERED) {
    return RecommendationStatus.CONSIDERING_RECALL
  }
  if (status === RecommendationResponse.status.DRAFT) {
    if (isNoRecall) {
      return RecommendationStatus.MAKING_DECISION_NOT_TO_RECALL
    }
    if (isRecall) {
      return RecommendationStatus.MAKING_DECISION_TO_RECALL
    }
    return RecommendationStatus.RECOMMENDATION_STARTED
  }
  logger.error(`recommendationStatus: could not determine recommendation status from status: ${status}`)
  return RecommendationStatus.UNKNOWN
}

export const recommendationsListStatusLabel = (status: RecommendationStatus) => {
  switch (status) {
    case RecommendationStatus.CONSIDERING_RECALL:
      return 'Considering recall'
    case RecommendationStatus.RECOMMENDATION_STARTED:
      return 'Recommendation started'
    case RecommendationStatus.MAKING_DECISION_TO_RECALL:
      return 'Making decision to recall'
    case RecommendationStatus.MAKING_DECISION_NOT_TO_RECALL:
      return 'Making decision not to recall'
    case RecommendationStatus.DECIDED_TO_RECALL:
      return 'Decided to recall'
    case RecommendationStatus.DECIDED_NOT_TO_RECALL:
      return 'Decided not to recall'
    default:
      return 'Unknown'
  }
}
