import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { RecommendationStatusResponse } from '../@types/make-recall-decision-api/models/RecommendationStatusReponse'
import type { FeatureFlags } from '../@types/featureFlags'
import { ppudCreateRecall, updateRecommendation } from '../data/makeDecisionApiClient'
import BookingMemento from './BookingMemento'
import StageEnum from './StageEnum'
import recommendationUtils from '../utils/recommendationUtils'

function deriveRecallTypeForPpud(recommendation: RecommendationResponse, statuses: RecommendationStatusResponse[]) {
  const isOoh = recommendationUtils.isOutOfHoursRecall(statuses)
  if (isOoh || recommendation.isThisAnEmergencyRecall) {
    return 'Emergency to be determined'
  }
  return 'To be determined'
}

export default async function updateRecall(
  bookingMemento: BookingMemento,
  recommendation: RecommendationResponse,
  token: string,
  featureFlags: FeatureFlags,
  statuses: RecommendationStatusResponse[] = [],
) {
  const memento = { ...bookingMemento }

  if (memento.stage !== StageEnum.RELEASE_BOOKED) {
    return memento
  }

  const isInCustody = recommendation.prisonOffender?.status === 'ACTIVE IN'

  const createRecallResponse = await ppudCreateRecall(token, memento.offenderId, memento.releaseId, {
    decisionDateTime: recommendation.decisionDateTime,
    isInCustody,
    mappaLevel: recommendation.bookRecallToPpud.mappaLevel,
    policeForce: recommendation.bookRecallToPpud.policeForce,
    probationArea: recommendation.bookRecallToPpud.probationArea,
    receivedDateTime: recommendation.bookRecallToPpud.receivedDateTime,
    recallTypeForPpud: deriveRecallTypeForPpud(recommendation, statuses),
    riskOfContrabandDetails: recommendation.hasContrabandRisk?.details || '',
  })

  memento.stage = StageEnum.RECALL_BOOKED
  memento.recallId = createRecallResponse.recall.id
  memento.failed = undefined
  memento.failedMessage = undefined

  await updateRecommendation({
    recommendationId: String(recommendation.id),
    valuesToSave: {
      bookingMemento: memento,
    },
    token,
    featureFlags,
  })

  return memento
}
