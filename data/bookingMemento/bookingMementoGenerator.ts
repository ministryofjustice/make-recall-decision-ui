import { faker } from '@faker-js/faker'
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
  generate: options => ({
    stage: options?.stage ?? faker.helpers.arrayElement(Object.values(StageEnum)),
    offenderId: options?.offenderId ?? faker.number.int.toString(),
    sentenceId: options?.sentenceId ?? faker.string.alphanumeric(),
    releaseId: options?.releaseId ?? faker.string.alphanumeric(),
    recallId: options?.recallId ?? faker.string.alphanumeric(),
    failed: options?.failed ?? faker.datatype.boolean(),
    failedMessage: options?.failedMessage ?? faker.lorem.sentence(),
    uploaded: options?.uploaded ?? faker.helpers.multiple(() => faker.lorem.word()),
  }),
}
