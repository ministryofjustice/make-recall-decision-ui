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

  // The user has no options to change offence values, so we don't need to update anything in PPUD here
  if (custodyGroup === CUSTODY_GROUP.DETERMINATE) {
    const nomisOffence = recommendation.nomisIndexOffence.allOptions.find(
      o => o.offenderChargeId === recommendation.nomisIndexOffence.selected
    )

    await ppudUpdateOffence(token, memento.offenderId, memento.sentenceId, {
      indexOffence: recommendation.bookRecallToPpud?.indexOffence,
      indexOffenceComment: recommendation.bookRecallToPpud?.indexOffenceComment,
      dateOfIndexOffence: nomisOffence.offenceDate,
    })
  }

  // Although technically nothing is booked for indeterminate cases, the purpose of the stage is
  // to avoid running the same stage twice, so it's acceptable to mark as if the offence was booked
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
