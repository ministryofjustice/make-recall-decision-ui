import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { FeatureFlags } from '../@types/featureFlags'
import { ppudCreateSentence, ppudUpdateSentence, updateRecommendation } from '../data/makeDecisionApiClient'
import BookingMemento from './BookingMemento'
import { StageEnum } from './StageEnum'

export default async function createOrUpdateSentence(
  bookingMemento: BookingMemento,
  recommendation: RecommendationResponse,
  token: string,
  featureFlags: FeatureFlags
) {
  const memento = { ...bookingMemento }

  if (memento.stage !== StageEnum.OFFENDER_BOOKED) {
    return memento
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

  if (recommendation.bookRecallToPpud.ppudSentenceId === 'ADD_NEW') {
    const createSentenceResponse = await ppudCreateSentence(token, memento.offenderId, {
      custodyType: recommendation.bookRecallToPpud?.custodyType,
      mappaLevel: recommendation.bookRecallToPpud?.mappaLevel,
      dateOfSentence: nomisOffence.sentenceDate,
      licenceExpiryDate: nomisOffence.licenceExpiryDate,
      releaseDate: nomisOffence.releaseDate,
      sentenceLength,
      sentenceExpiryDate: nomisOffence.sentenceEndDate,
      sentencingCourt: nomisOffence.courtDescription,
    })

    memento.sentenceId = createSentenceResponse.sentence.id
  } else {
    await ppudUpdateSentence(token, memento.offenderId, memento.sentenceId, {
      custodyType: recommendation.bookRecallToPpud?.custodyType,
      mappaLevel: recommendation.bookRecallToPpud?.mappaLevel,
      dateOfSentence: nomisOffence.sentenceDate,
      licenceExpiryDate: nomisOffence.licenceExpiryDate,
      releaseDate: nomisOffence.releaseDate,
      sentenceLength,
      sentenceExpiryDate: nomisOffence.sentenceEndDate,
      sentencingCourt: nomisOffence.courtDescription,
    })
  }

  memento.stage = StageEnum.SENTENCE_BOOKED
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
