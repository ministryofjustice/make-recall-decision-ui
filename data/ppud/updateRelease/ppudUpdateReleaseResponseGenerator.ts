import { faker } from '@faker-js/faker'
import { DataGenerator } from '../../@generators/dataGenerators'
import { PpudUpdateReleaseResponse } from '../../../server/@types/make-recall-decision-api/models/PpudUpdateReleaseResponse'

export type PpudUpdateReleaseResponseOptions = {
  releaseId?: string
}

export const PpudUpdateReleaseResponseGenerator: DataGenerator<
  PpudUpdateReleaseResponse,
  PpudUpdateReleaseResponseOptions
> = {
  generate: options => ({
    release: {
      id: options?.releaseId ?? faker.string.alphanumeric(),
    },
  }),
}
