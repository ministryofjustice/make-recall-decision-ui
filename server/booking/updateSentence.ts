import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { FeatureFlags } from '../@types/featureFlags'
import { ppudUpdateSentence, updateRecommendation } from '../data/makeDecisionApiClient'
import BookingMomento from './BookingMomento'
import { StageEnum } from './StageEnum'

export default async function updateSentence(
  bookingMomento: BookingMomento,
  recommendation: RecommendationResponse,
  token: string,
  featureFlags: FeatureFlags
) {
  const momento = { ...bookingMomento }

  if (momento.stage !== StageEnum.OFFENDER_BOOKED) {
    return momento
  }

  const nomisOffence = recommendation.nomisIndexOffence.allOptions.find(
    o => o.offenderChargeId === recommendation.nomisIndexOffence.selected
  )

  const offenceTerm = nomisOffence.terms.find(term => term.code === 'IMP')

  const sentenceLength =
    offenceTerm != null
      ? {
          partDays: offenceTerm?.days || 0,
          partMonths: offenceTerm?.months || 0,
          partYears: offenceTerm?.years || 0,
        }
      : null

  await ppudUpdateSentence(token, momento.offenderId, momento.sentenceId, {
    custodyType: recommendation.bookRecallToPpud?.custodyType,
    mappaLevel: recommendation.bookRecallToPpud?.mappaLevel,
    dateOfSentence: nomisOffence.sentenceDate,
    licenceExpiryDate: nomisOffence.licenceExpiryDate,
    releaseDate: nomisOffence.releaseDate,
    sentenceLength,
    sentenceExpiryDate: nomisOffence.sentenceEndDate,
    sentencingCourt: nomisOffence.courtDescription,
  })

  momento.stage = StageEnum.SENTENCE_BOOKED
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
