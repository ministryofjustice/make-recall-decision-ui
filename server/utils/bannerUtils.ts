import { Status, RecommendationBanner } from '../@types/caseSummary'
import { STATUSES } from '../middleware/recommendationStatusCheck'

/**
 * Creates a new banner object based on the current statuses, the user's role, and recommendation details.
 *
 * @param statuses - List of current statuses to determine banner visibility and text.
 * @param recommendation - Details about the recommendation for the banner text.
 * @param recommendationId - The unique identifier of the active recommendation.
 * @param isSpo - Flag indicating if the current user is a Senior Probation Officer. false indifates a Probation Practitioner.
 * @returns A new RecommendationBanner object.
 */
export function createRecommendationBanner(
  statuses: Status[],
  recommendation: { createdByUserFullName: string; createdDate: string; personOnProbation: { name: string } },
  recommendationId: string,
  isSpo: boolean
): RecommendationBanner {
  const banner = {
    display: false,
    createdByUserFullName: '',
    createdDate: '',
    personOnProbationName: '',
    recommendationId: '',
    linkText: '',
    text: '',
    dataAnalyticsEventCategory: '',
  }

  // Recommendation banner should only be visible for the following statuses
  const isDoNotRecall = !!statuses.find(status => status.name === STATUSES.NO_RECALL_DECIDED && status.active)
  const isRecallDecided = !!statuses.find(status => status.name === STATUSES.RECALL_DECIDED && status.active)
  const isRecallStarted = !!statuses.find(status => status.name === STATUSES.PO_START_RECALL && status.active)
  const isSentToPpcs = !!statuses.find(status => status.name === STATUSES.SENT_TO_PPCS && status.active)

  banner.display = false
  banner.createdByUserFullName = recommendation.createdByUserFullName
  banner.createdDate = recommendation.createdDate
  banner.personOnProbationName = recommendation.personOnProbation.name
  banner.recommendationId = recommendationId

  if (!isSentToPpcs) {
    if (isDoNotRecall) {
      if (isSpo) {
        banner.linkText = 'Delete the decision not to recall'
        banner.dataAnalyticsEventCategory = 'spo_delete_dntr_click'
      }
      banner.display = true
      banner.text = 'started a decision not to recall letter for'
    } else if (isRecallDecided) {
      if (isSpo) {
        banner.linkText = 'Delete the Part A'
        banner.dataAnalyticsEventCategory = 'spo_delete_part_a_click'
      }
      banner.display = true
      banner.text = 'started a Part A for'
    } else if (isRecallStarted) {
      if (isSpo) {
        banner.linkText = 'Delete the recommendation'
        banner.dataAnalyticsEventCategory = 'spo_delete_recommendation_click'
      }
      banner.display = true
      banner.text = 'started a recommendation for'
    }
  }
  return banner
}
