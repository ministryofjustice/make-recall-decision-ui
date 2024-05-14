import { FeatureFlags } from '../@types/featureFlags'
import { ppudUploadMandatoryDocument, updateRecommendation } from '../data/makeDecisionApiClient'
import BookingMemento from './BookingMemento'
import { StageEnum } from './StageEnum'
import { isDefined } from '../utils/utils'

export default async function uploadMandatoryDocument(
  bookingMemento: BookingMemento,
  recommendationId: string,
  previousStage: StageEnum,
  nextStage: StageEnum,
  id: string,
  category: string,
  token: string,
  featureFlags: FeatureFlags
) {
  const memento = { ...bookingMemento }

  if (memento.stage !== previousStage) {
    return memento
  }

  if (!isDefined(id)) {
    throw new Error(`Document  id not found for ${category}`)
  }

  await ppudUploadMandatoryDocument(token, memento.recallId, { id, category })

  memento.stage = nextStage
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
