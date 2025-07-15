import { fakerEN_GB as faker } from '@faker-js/faker'
import { PpudSentenceData } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'
import { DataGenerator } from '../@generators/dataGenerators'

export type PpudSentenceDataOptions = {
  offenceDescription?: string
  releaseDate?: Date
  sentencingCourt?: string
  dateOfSentence?: Date
}

export const PpudSentenceDataGenerator: DataGenerator<PpudSentenceData, PpudSentenceDataOptions> = {
  generate: (options?: PpudSentenceDataOptions) => ({
    offenceDescription: options.offenceDescription ?? faker.lorem.sentence(),
    releaseDate: (options.releaseDate ?? faker.date.future()).toISOString(),
    sentencingCourt: options.sentencingCourt ?? `${faker.location.city()} Court`,
    dateOfSentence: (options.dateOfSentence ?? faker.date.past()).toISOString(),
  }),
}
