import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { FeatureFlags } from '../@types/featureFlags'
import { ppudUpdateOffence, updateRecommendation } from '../data/makeDecisionApiClient'
import BookingMemento from './BookingMemento'
import { StageEnum } from './StageEnum'
import { CUSTODY_GROUP } from '../@types/make-recall-decision-api/models/ppud/CustodyGroup'

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

  const { custodyGroup } = recommendation.bookRecallToPpud

  if (custodyGroup === CUSTODY_GROUP.DETERMINATE) {
    const nomisOffence = recommendation.nomisIndexOffence.allOptions.find(
      o => o.offenderChargeId === recommendation.nomisIndexOffence.selected
    )

    await ppudUpdateOffence(token, memento.offenderId, memento.sentenceId, {
      indexOffence: recommendation.bookRecallToPpud?.indexOffence,
      indexOffenceComment: recommendation.bookRecallToPpud?.indexOffenceComment,
      dateOfIndexOffence: nomisOffence.offenceDate,
    })
  } else if (custodyGroup === CUSTODY_GROUP.INDETERMINATE) {
    const selectedSentence = recommendation.ppudOffender.sentences.find(
      s => s.id === recommendation.bookRecallToPpud.ppudSentenceId
    )
    await ppudUpdateOffence(token, memento.offenderId, memento.sentenceId, {
      indexOffence: recommendation.bookRecallToPpud.ppudIndeterminateSentenceData.offenceDescription,
      indexOffenceComment: recommendation.bookRecallToPpud.ppudIndeterminateSentenceData.offenceDescriptionComment,
      dateOfIndexOffence: selectedSentence.offence.dateOfIndexOffence,
    })
  }

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
