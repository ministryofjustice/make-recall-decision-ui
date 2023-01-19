import { RecommendationResponse } from './make-recall-decision-api'

export interface RecommendationDecorated extends RecommendationResponse {
  isInCustody?: boolean
}
