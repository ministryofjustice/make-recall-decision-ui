import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { FeatureFlags } from '../@types/featureFlags'
import { ppudCreateRecall, updateRecommendation } from '../data/makeDecisionApiClient'
import BookingMemento from './BookingMemento'
import { StageEnum } from './StageEnum'

export default async function updateRecall(
  bookingMemento: BookingMemento,
  recommendation: RecommendationResponse,
  token: string,
  featureFlags: FeatureFlags
) {
  const memento = { ...bookingMemento }

  if (memento.stage !== StageEnum.RELEASE_BOOKED) {
    return memento
  }

  const isInCustody = recommendation.prisonOffender?.status === 'ACTIVE IN'

  const createRecallResponse = await ppudCreateRecall(token, memento.offenderId, memento.releaseId, {
    decisionDateTime: recommendation.decisionDateTime,
    isExtendedSentence: recommendation.isExtendedSentence,
    isInCustody,
    mappaLevel: recommendation.bookRecallToPpud.mappaLevel,
    policeForce: recommendation.bookRecallToPpud.policeForce,
    probationArea: recommendation.bookRecallToPpud.probationArea,
    receivedDateTime: recommendation.bookRecallToPpud.receivedDateTime,
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
