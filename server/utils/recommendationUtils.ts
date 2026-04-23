import { RecommendationStatusResponse } from '../@types/make-recall-decision-api/models/RecommendationStatusReponse'
import RECOMMENDATION_STATUS from '../middleware/recommendationStatus'

const hasActiveStatus = (statuses: RecommendationStatusResponse[], expectedStatus: RECOMMENDATION_STATUS): boolean =>
  !!statuses?.filter(s => s.active).find(s => s.name === expectedStatus)

export default { hasActiveStatus }
