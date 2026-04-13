import { faker } from '@faker-js/faker'
import { DataGenerator } from '../@generators/dataGenerators'
import { PpudOffence } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'

export type PpudOffenceOptions = {
  indexOffence?: string
  indexOffenceComment?: string
  dateOfIndexOffence?: string
}

export const PpudOffenceGenerator: DataGenerator<PpudOffence, PpudOffenceOptions> = {
  generate: (options: PpudOffenceOptions) => ({
    indexOffence: options?.indexOffence ?? faker.lorem.sentence(),
    indexOffenceComment: options?.indexOffenceComment ?? faker.lorem.sentences(),
    dateOfIndexOffence: options?.dateOfIndexOffence ?? faker.date.past().toISOString(),
  }),
}
