import { FeatureFlags } from '../@types/featureFlags'
import { ppudUploadMandatoryDocument, updateRecommendation } from '../data/makeDecisionApiClient'
import BookingMemento from './BookingMemento'

export default async function uploadMandatoryDocument(
  bookingMemento: BookingMemento,
  recommendationId: string,
  id: string,
  category: string,
  token: string,
  featureFlags: FeatureFlags
) {
  const memento = { uploaded: [] as string[], ...bookingMemento }

  if (memento.uploaded && memento.uploaded.includes(id)) {
    return memento
  }

  await ppudUploadMandatoryDocument(token, memento.recallId, { id, category })

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
