import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { FeatureFlags } from '../@types/featureFlags'
import { ppudUpdateOffence, updateRecommendation } from '../data/makeDecisionApiClient'
import BookingMemento from './BookingMemento'
import { StageEnum } from './StageEnum'

export default async function updateOffence(
  bookingMemento: BookingMemento,
  recommendation: RecommendationResponse,
  token: string,
  featureFlags: FeatureFlags
) {
  const memento = { ...bookingMemento }

  if (memento.stage !== StageEnum.SENTENCE_BOOKED) {
    return memento
  }

  const nomisOffence = recommendation.nomisIndexOffence.allOptions.find(
    o => o.offenderChargeId === recommendation.nomisIndexOffence.selected
  )

  await ppudUpdateOffence(token, memento.offenderId, memento.sentenceId, {
    indexOffence: recommendation.bookRecallToPpud?.indexOffence,
    indexOffenceComment: recommendation.bookRecallToPpud?.indexOffenceComment,
    dateOfIndexOffence: nomisOffence.offenceDate,
  })

  memento.stage = StageEnum.OFFENCE_BOOKED
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
