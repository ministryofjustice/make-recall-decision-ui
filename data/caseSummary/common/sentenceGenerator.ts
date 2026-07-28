import { faker } from '@faker-js/faker/locale/en_GB'
import { DataGenerator } from '../../@generators/dataGenerators'
import { Sentence } from '../../../server/@types/make-recall-decision-api/models/Sentence'

export type SentenceOptions = {
  description?: string
  length?: number
  lengthUnits?: string
  sentenceExpiryDate?: string
  licenceExpiryDate?: string
  isCustodial?: boolean
  custodialStatusCode?: string
}

export const SentenceGenerator: DataGenerator<Sentence, SentenceOptions> = {
  generate: options => ({
    description: options?.description ?? faker.lorem.words(),
    length: options?.length ?? faker.number.int({ min: 1, max: 120 }),
    lengthUnits: options?.lengthUnits ?? faker.helpers.arrayElement(['days', 'weeks', 'months', 'years']),
    sentenceExpiryDate: options?.sentenceExpiryDate ?? faker.date.future().toISOString(),
    licenceExpiryDate: options?.licenceExpiryDate ?? faker.date.future().toISOString(),
    isCustodial: options?.isCustodial ?? faker.datatype.boolean(),
    custodialStatusCode: options?.custodialStatusCode ?? faker.lorem.word(),
  }),
}
