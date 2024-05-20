import BookingMemento from './BookingMemento'
import { FeatureFlags } from '../@types/featureFlags'
import { ppudCreateMinute, updateRecommendation } from '../data/makeDecisionApiClient'
import { StageEnum } from './StageEnum'

export default async function createMinute(
  bookingMemento: BookingMemento,
  recommendationId: string,
  subject: string,
  text: string,
  token: string,
  featureFlags: FeatureFlags
) {
  const memento = { ...bookingMemento }

  if (memento.stage !== StageEnum.RECALL_BOOKED) {
    return memento
  }

  await ppudCreateMinute(token, memento.recallId, { subject, text })

  memento.stage = StageEnum.MINUTE_BOOKED
  memento.failed = undefined
  memento.failedMessage = undefined

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      bookingMemento: memento,
    },
    token,
    featureFlags,
  })

  return memento
}
