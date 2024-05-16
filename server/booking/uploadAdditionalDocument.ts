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
  const memento = { uploadedAdditional: [] as string[], ...bookingMemento }

  if (memento.uploadedAdditional && memento.uploadedAdditional.includes(id)) {
    return memento
  }

  await ppudUploadAdditionalDocument(token, memento.recallId, { id })

  memento.uploadedAdditional.push(id)
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
