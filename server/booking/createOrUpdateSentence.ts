import { RecommendationResponse } from '../@types/make-recall-decision-api'
import type { FeatureFlags } from '../@types/featureFlags'
import { ppudCreateSentence, ppudUpdateSentence, updateRecommendation } from '../data/makeDecisionApiClient'
import BookingMemento from './BookingMemento'
import StageEnum from './StageEnum'
import { PpudUpdateSentenceRequest } from '../@types/make-recall-decision-api/models/PpudUpdateSentenceRequest'
import CUSTODY_GROUP from '../@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { SentenceGroup } from '../controllers/recommendations/sentenceInformation/formOptions'
import SENTENCED_AS_YOUTH from '../@types/make-recall-decision-api/models/ppud/SentencedAsYouth'
import { Term } from '../@types/make-recall-decision-api/models/PrisonSentence'
import getTotalSentenceLength from '../utils/totalSentenceLength'

function calculateOffenceDays(offenceTerm: Term): number {
  const days = offenceTerm?.days ?? 0
  const weeksInDays = (offenceTerm?.weeks ?? 0) * 7
  return days + weeksInDays
}

function buildDeterminateSentenceRequest(recommendation: RecommendationResponse): PpudUpdateSentenceRequest {
  const nomisOffence = recommendation.nomisIndexOffence.allOptions.find(
    o => o.offenderChargeId === recommendation.nomisIndexOffence.selected,
  )

  const totalSentenceLength = getTotalSentenceLength(recommendation)
  const offenceTerm = nomisOffence.terms.find(term => term.code === 'IMP')
  let sentenceLength: PpudUpdateSentenceRequest['sentenceLength'] = null
  if (totalSentenceLength) {
    // MRD-3362 - for a consecutive sequence, PPCS enter the total sentence length (already converted to
    // years, months and days), which replaces the index offence's own term
    sentenceLength = {
      partYears: totalSentenceLength.partYears ?? 0,
      partMonths: totalSentenceLength.partMonths ?? 0,
      partDays: totalSentenceLength.partDays ?? 0,
    }
  } else if (offenceTerm != null) {
    sentenceLength = {
      // MRD-3238 - PPUD simply doesn't support weeks,
      // so any part of the term in weeks needs to be converted into days.
      partDays: calculateOffenceDays(offenceTerm),
      partMonths: offenceTerm?.months || 0,
      partYears: offenceTerm?.years || 0,
    }
  }

  return {
    custodyType: recommendation.bookRecallToPpud?.custodyType,
    mappaLevel: recommendation.bookRecallToPpud?.mappaLevel,
    dateOfSentence: nomisOffence.sentenceDate,
    licenceExpiryDate: nomisOffence.licenceExpiryDate,
    releaseDate: nomisOffence.releaseDate,
    sentenceLength,
    // Although PPCS calculates the sequence expiry date slightly differently, this is close enough for now. Support
    // for editing this date or for sourcing/calculating it differently may be added in the future. There is no sequence
    // expiry date in PPUD, but they have told us it is OK to use the sentence expiry date field here, as they do it too
    sentenceExpiryDate: nomisOffence.sentenceSequenceExpiryDate,
    sentencingCourt: nomisOffence.courtDescription,
    sentencedUnder: recommendation.bookRecallToPpud?.legislationSentencedUnder,
    sentencedAsYouth:
      recommendation.sentenceGroup === SentenceGroup.YOUTH_SDS ? SENTENCED_AS_YOUTH.YES : SENTENCED_AS_YOUTH.NO,
  }
}

function buildIndeterminateSentenceRequest(recommendation: RecommendationResponse): PpudUpdateSentenceRequest {
  const selectedPpudSentence = recommendation.ppudOffender.sentences.find(
    sentence => sentence.id === recommendation.bookRecallToPpud.ppudSentenceId,
  )
  const editedIndeterminateSentenceData = recommendation.bookRecallToPpud.ppudIndeterminateSentenceData

  return {
    custodyType: selectedPpudSentence.custodyType,
    dateOfSentence: editedIndeterminateSentenceData.dateOfSentence,
    sentencingCourt: editedIndeterminateSentenceData.sentencingCourt,
    sentencedAsYouth:
      recommendation.sentenceGroup === SentenceGroup.YOUTH_SDS ? SENTENCED_AS_YOUTH.YES : SENTENCED_AS_YOUTH.NO,
  }
}

export default async function createOrUpdateSentence(
  bookingMemento: BookingMemento,
  recommendation: RecommendationResponse,
  token: string,
  featureFlags: FeatureFlags,
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
