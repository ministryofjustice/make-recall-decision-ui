import { RecommendationStatusResponse } from './RecommendationStatusReponse'
import { RecallType } from './RecallType'
import { RecommendationsListItem } from './RecommendationsListItem'

export type LastCompletedRecommendationsListItem = {
  recommendationId?: number;
  lastModifiedByName?: string;
  createdDate?: string;
  lastModifiedDate?: string;
  status?: RecommendationsListItem.status;
  statuses?: RecommendationStatusResponse[];
  recallType?: RecallType;
  completedDate? : string;
};