import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { FeatureFlags } from '../@types/featureFlags'
import { ppudUpdateOffence, updateRecommendation } from '../data/makeDecisionApiClient'
import BookingMomento from './BookingMomento'
import { StageEnum } from './StageEnum'

export default async function updateOffence(
  bookingMomento: BookingMomento,
  recommendation: RecommendationResponse,
  token: string,
  featureFlags: FeatureFlags
) {
  const momento = { ...bookingMomento }

  if (momento.stage !== StageEnum.SENTENCE_BOOKED) {
    return momento
  }

  const nomisOffence = recommendation.nomisIndexOffence.allOptions.find(
    o => o.offenderChargeId === recommendation.nomisIndexOffence.selected
  )

  await ppudUpdateOffence(token, momento.offenderId, momento.sentenceId, {
    indexOffence: recommendation.bookRecallToPpud?.indexOffence,
    dateOfIndexOffence: nomisOffence.offenceDate,
  })

  momento.stage = StageEnum.OFFENCE_BOOKED
  momento.failed = undefined
  momento.failedMessage = undefined

  await updateRecommendation({
    recommendationId: String(recommendation.id),
    valuesToSave: {
      bookingMomento: momento,
    },
    token,
    featureFlags,
  })

  return momento
}
