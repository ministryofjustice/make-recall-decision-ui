import { fakerEN_GB as faker } from '@faker-js/faker'
import StageEnum from '../../server/booking/StageEnum'
import { DataGenerator } from '../@generators/dataGenerators'
import BookingMemento from '../../server/booking/BookingMemento'
import BookingErrorType from '../../server/booking/BookingErrorType'

export type BookingMementoOptions = {
  stage?: StageEnum
  offenderId?: string
  sentenceId?: string
  releaseId?: string
  recallId?: string
  failed?: boolean
  failedMessage?: string
  errorType?: BookingErrorType
  uploadFailedDocName?: string
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
      errorType: options?.errorType ?? BookingErrorType.DATA,
      uploadFailedDocName: options?.uploadFailedDocName ?? `${faker.word.words(6)}.pdf`,
      uploaded: options?.uploaded ?? [faker.string.uuid(), faker.string.uuid()],
    }
  },
}
