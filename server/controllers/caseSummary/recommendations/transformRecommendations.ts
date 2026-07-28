import { RecommendationsResponse } from '../../../@types/make-recall-decision-api'
import { recommendationStatus } from '../../recommendations/helpers/recommendationStatus'

const transformRecommendations = (caseSummary: RecommendationsResponse) => {
  return {
    ...caseSummary,
    recommendations: caseSummary.recommendations.map(recommendation => ({
      ...recommendation,
      statusForRecallType: recommendationStatus(recommendation),
    })),
  }
}

export default transformRecommendations
