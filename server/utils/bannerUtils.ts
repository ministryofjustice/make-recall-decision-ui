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

  const status = statuses.find(s => ['NO_RECALL_DECIDED', 'RECALL_DECIDED', 'PO_START_RECALL'].includes(s.name))
  if (status && status.active) {
    banner.display = true
    banner.createdByUserFullName = recommendation.createdByUserFullName
    banner.createdDate = recommendation.createdDate
    banner.personOnProbationName = recommendation.personOnProbation.name
    banner.recommendationId = recommendationId

    switch (status.name) {
      case STATUSES.NO_RECALL_DECIDED:
        banner.text = 'started a decision not to recall letter for'
        if (isSpo) {
          banner.linkText = 'Delete the decision not to recall'
          banner.dataAnalyticsEventCategory = 'spo_delete_dntr_click'
        }
        break
      case STATUSES.RECALL_DECIDED:
        banner.text = 'started a Part A for'
        if (isSpo) {
          banner.linkText = 'Delete the Part A'
          banner.dataAnalyticsEventCategory = 'spo_delete_part_a_click'
        }
        break
      case STATUSES.PO_START_RECALL:
        banner.text = 'started a recommendation for'
        if (isSpo) {
          banner.linkText = 'Delete the recommendation'
          banner.dataAnalyticsEventCategory = 'spo_delete_recommendation_click'
        }
        break
      default:
        // Explicitly set display to false if no relevant status is active
        banner.display = false
        break
    }
  }

  return banner
}
