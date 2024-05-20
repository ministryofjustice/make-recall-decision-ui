import { FeatureFlags } from '../@types/featureFlags'
import { ppudUploadAdditionalDocument, updateRecommendation } from '../data/makeDecisionApiClient'
import BookingMemento from './BookingMemento'

export default async function uploadAdditionalDocument(
  bookingMemento: BookingMemento,
  recommendationId: string,
  id: string,
  token: string,
  featureFlags: FeatureFlags
) {
  const memento = { uploaded: [] as string[], ...bookingMemento }

  if (memento.uploaded && memento.uploaded.includes(id)) {
    return memento
  }

  await ppudUploadAdditionalDocument(token, memento.recallId, { id })

  memento.uploaded.push(id)
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
