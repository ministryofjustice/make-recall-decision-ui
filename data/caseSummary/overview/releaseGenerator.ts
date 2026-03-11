import { faker } from '@faker-js/faker/locale/en_GB'
import { DataGenerator } from '../../@generators/dataGenerators'
import { Release } from '../../../server/@types/make-recall-decision-api'

export type ReleaseOptions = {
  releaseDate?: string
  recallDate?: string
}

export const ReleaseGenerator: DataGenerator<Release, ReleaseOptions> = {
  generate: options => ({
    releaseDate: options?.releaseDate ?? faker.date.past().toISOString(),
    recallDate: options?.recallDate ?? faker.date.past().toISOString(),
  }),
}
