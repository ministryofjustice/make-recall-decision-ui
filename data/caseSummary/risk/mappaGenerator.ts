import { faker } from '@faker-js/faker/locale/en_GB'
import { Mappa } from '../../../server/@types/make-recall-decision-api'
import { DataGenerator } from '../../@generators/dataGenerators'

export type MappaOptions = {
  level?: number
  lastUpdatedDate?: string
  category?: number
  error?: string
  hasBeenReviewed?: boolean
}

export const MappaGenerator: DataGenerator<Mappa, MappaOptions> = {
  generate: options => ({
    level: options?.level ?? faker.number.int({ min: 1, max: 3 }),
    lastUpdatedDate: options?.lastUpdatedDate ?? faker.date.past().toISOString(),
    category: options?.category ?? faker.number.int({ min: 1, max: 4 }),
    error: options?.error ?? faker.lorem.sentence(),
    hasBeenReviewed: options?.hasBeenReviewed ?? faker.datatype.boolean(),
  }),
}
