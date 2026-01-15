import { fakerEN_GB as faker } from '@faker-js/faker'
import { StageEnum } from '../../server/booking/StageEnum'
import { DataGenerator } from '../@generators/dataGenerators'
import BookingMemento from '../../server/booking/BookingMemento'

export type BookingMementoOptions = {
  stage?: StageEnum
  offenderId?: string
  sentenceId?: string
  releaseId?: string
  recallId?: string
  failed?: boolean
  failedMessage?: string
  uploaded?: string[]
}

export const BookingMementoGenerator: DataGenerator<BookingMemento, BookingMementoOptions> = {
  generate: options => {
    return {
      stage: options?.stage ?? faker.helpers.enumValue(StageEnum),
      offenderId: options?.offenderId ?? faker.string.uuid(),
      sentenceId: options?.sentenceId ?? faker.string.uuid(),
      releaseId: options?.releaseId ?? faker.string.uuid(),
      recallId: options?.recallId ?? faker.string.uuid(),
      failed: options?.failed ?? faker.datatype.boolean(),
      failedMessage: options?.failedMessage ?? faker.lorem.sentence(),
      uploaded: options?.uploaded ?? [faker.string.uuid(), faker.string.uuid()],
    }
  },
}
