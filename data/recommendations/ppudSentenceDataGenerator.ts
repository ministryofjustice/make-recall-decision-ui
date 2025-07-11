import { fakerEN_GB as faker } from '@faker-js/faker'
import { PPUDSentenceData } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'
import { DataGenerator } from '../@generators/dataGenerators'

export type PPUDSentenceDataOptions = {
  offenceDescription?: string
  releaseDate?: Date
  sentencingCourt?: string
  dateOfSentence?: Date
}

export const PPUDSentenceDataGenerator: DataGenerator<PPUDSentenceData, PPUDSentenceDataOptions> = {
  generate: (options?: PPUDSentenceDataOptions) => ({
    offenceDescription: options.offenceDescription ?? faker.lorem.sentence(),
    releaseDate: (options.releaseDate ?? faker.date.future()).toISOString(),
    sentencingCourt: options.sentencingCourt ?? `${faker.location.city()} Court`,
    dateOfSentence: (options.dateOfSentence ?? faker.date.past()).toISOString(),
  }),
}
