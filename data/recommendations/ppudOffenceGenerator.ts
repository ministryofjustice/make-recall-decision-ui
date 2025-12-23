import { faker } from '@faker-js/faker'
import { DataGenerator } from '../@generators/dataGenerators'
import { PpudOffence } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'

export type PpudOffenceOptions = {
  indexOffence?: string
  offenceComment?: string
  dateOfIndexOffence?: string
}

export const PpudOffenceGenerator: DataGenerator<PpudOffence, PpudOffenceOptions> = {
  generate: (options: PpudOffenceOptions) => ({
    indexOffence: options?.indexOffence ?? faker.lorem.sentence(),
    offenceComment: options?.offenceComment ?? faker.lorem.sentences(),
    dateOfIndexOffence: options?.dateOfIndexOffence ?? faker.date.past().toISOString(),
  }),
}
