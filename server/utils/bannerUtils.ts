import { Status, RecommendationBanner } from '../@types/caseSummary'

/**
 * Creates a new banner object based on the current statuses, the user's role, and recommendation details.
 *
 * @param statuses - List of current statuses to determine banner visibility and text.
 * @param recommendation - Details about the recommendation for the banner text.
 * @param recommendationId - The unique identifier of the active recommendation.
 * @param isSpo - Flag indicating if the current user is a Senior Probation Officer.
 * @param isProbationPractitioner - Flag indicating if the current user is a Probation Practitioner.
 * @returns A new RecommendationBanner object.
 */
export function createRecommendationBanner(
  statuses: Status[],
  recommendation: { createdByUserFullName: string; createdDate: string; personOnProbation: { name: string } },
  recommendationId: string,
  isSpo: boolean,
  isProbationPractitioner: boolean
): RecommendationBanner {
  const banner: RecommendationBanner = {
    display: false,
    createdByUserFullName: '',
    createdDate: '',
    personOnProbationName: '',
    recommendationId: '',
    linkText: '',
    text: '',
    dataAnalyticsEventCategory: '',
  }

  const isActive = statuses.some(
    status => status.active && ['NO_RECALL_DECIDED', 'RECALL_DECIDED', 'PO_START_RECALL'].includes(status.name)
  )

  if (isActive) {
    banner.display = true
    banner.createdByUserFullName = recommendation.createdByUserFullName
    banner.createdDate = recommendation.createdDate
    banner.personOnProbationName = recommendation.personOnProbation.name
    banner.recommendationId = recommendationId

    if (isSpo) {
      banner.text = determineBannerText(statuses)
      banner.linkText = determineBannerLinkText(statuses)
      banner.dataAnalyticsEventCategory = determineDataAnalyticsEventCategory(statuses)
    } else if (isProbationPractitioner) {
      banner.text = determineBannerText(statuses)
      banner.linkText = '' // Probation Practitioners do not get a link.
    }
  }

  return banner
}

function determineBannerText(statuses: Status[]): string {
  if (statuses.some(status => status.name === 'NO_RECALL_DECIDED')) return 'started a decision not to recall letter for'
  if (statuses.some(status => status.name === 'RECALL_DECIDED')) return 'started a Part A for'
  if (statuses.some(status => status.name === 'PO_START_RECALL')) return 'started a recommendation for'
  return ''
}

function determineBannerLinkText(statuses: Status[]): string {
  if (statuses.some(status => status.name === 'NO_RECALL_DECIDED')) return 'Delete the decision not to recall'
  if (statuses.some(status => status.name === 'RECALL_DECIDED')) return 'Delete the Part A'
  if (statuses.some(status => status.name === 'PO_START_RECALL')) return 'Delete the recommendation'
  return ''
}

function determineDataAnalyticsEventCategory(statuses: Status[]): string {
  if (statuses.some(status => status.name === 'NO_RECALL_DECIDED')) return 'spo_delete_dntr_click'
  if (statuses.some(status => status.name === 'RECALL_DECIDED')) return 'spo_delete_part_a_click'
  if (statuses.some(status => status.name === 'PO_START_RECALL')) return 'spo_delete_recommendation_click'
  return ''
}
