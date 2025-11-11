import { faker } from '@faker-js/faker'
import { DataGenerator } from '../../@generators/dataGenerators'
import { PpudCreateSentenceResponse } from '../../../server/@types/make-recall-decision-api/models/PpudCreateSentenceResponse'

export type PpudCreateSentenceResponseOptions = {
  sentenceId?: string
}

export const PpudCreateSentenceResponseGenerator: DataGenerator<
  PpudCreateSentenceResponse,
  PpudCreateSentenceResponseOptions
> = {
  generate: options => ({
    sentence: {
      id: options?.sentenceId ?? faker.string.alphanumeric(),
    },
  }),
}
