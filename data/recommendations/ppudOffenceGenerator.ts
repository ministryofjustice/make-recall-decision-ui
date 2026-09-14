import { faker } from '@faker-js/faker'
import { DataGenerator, NoneOrOption } from '../@generators/dataGenerators'
import { PpudOffence } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'

export type PpudOffenceOptions = {
  indexOffence?: string
  indexOffenceComment?: NoneOrOption<string>
  dateOfIndexOffence?: string
}

export const PpudOffenceGenerator: DataGenerator<PpudOffence, PpudOffenceOptions> = {
  generate: (options: PpudOffenceOptions) => ({
    indexOffence: options?.indexOffence ?? faker.lorem.sentence(),
    indexOffenceComment:
      options?.indexOffenceComment === 'none' ? undefined : (options?.indexOffenceComment ?? faker.lorem.sentences()),
    dateOfIndexOffence: options?.dateOfIndexOffence ?? faker.date.past().toISOString(),
  }),
}
