import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { FeatureFlags } from '../@types/featureFlags'
import { ppudCreateSentence, ppudUpdateSentence, updateRecommendation } from '../data/makeDecisionApiClient'
import BookingMemento from './BookingMemento'
import { StageEnum } from './StageEnum'
import { PpudUpdateSentenceRequest } from '../@types/make-recall-decision-api/models/PpudUpdateSentenceRequest'
import { CUSTODY_GROUP } from '../@types/make-recall-decision-api/models/ppud/CustodyGroup'

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

  const { custodyGroup } = recommendation.bookRecallToPpud
  let sentence: PpudUpdateSentenceRequest
  switch (custodyGroup) {
    case CUSTODY_GROUP.DETERMINATE:
      sentence = buildDeterminateSentenceRequest(recommendation)
      break
    case CUSTODY_GROUP.INDETERMINATE:
      sentence = buildIndeterminateSentenceRequest(recommendation)
      break
    default:
      custodyGroup satisfies never
  }

  if (recommendation.bookRecallToPpud.ppudSentenceId === 'ADD_NEW') {
    const createSentenceResponse = await ppudCreateSentence(token, memento.offenderId, sentence)

    memento.sentenceId = createSentenceResponse.sentence.id
  } else {
    await ppudUpdateSentence(token, memento.offenderId, memento.sentenceId, sentence)
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

function buildDeterminateSentenceRequest(recommendation: RecommendationResponse): PpudUpdateSentenceRequest {
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

  return {
    custodyType: recommendation.bookRecallToPpud?.custodyType,
    mappaLevel: recommendation.bookRecallToPpud?.mappaLevel,
    dateOfSentence: nomisOffence.sentenceDate,
    licenceExpiryDate: nomisOffence.licenceExpiryDate,
    releaseDate: nomisOffence.releaseDate,
    sentenceLength,
    sentenceExpiryDate: nomisOffence.sentenceEndDate,
    sentencingCourt: nomisOffence.courtDescription,
    sentencedUnder: recommendation.bookRecallToPpud?.legislationSentencedUnder,
  }
}

function buildIndeterminateSentenceRequest(recommendation: RecommendationResponse): PpudUpdateSentenceRequest {
  const selectedPpudSentence = recommendation.ppudOffender.sentences.find(
    sentence => sentence.id === recommendation.bookRecallToPpud.ppudSentenceId
  )

  return {
    custodyType: selectedPpudSentence.custodyType,
    dateOfSentence: selectedPpudSentence.dateOfSentence,
    releaseDate: selectedPpudSentence.releaseDate,
    sentencingCourt: selectedPpudSentence.sentencingCourt,
  }
}
