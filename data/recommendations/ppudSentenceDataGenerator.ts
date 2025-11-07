import { fakerEN_GB as faker } from '@faker-js/faker'
import { PpudSentenceData } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'
import { AnyNoneOrOption, DataGenerator } from '../@generators/dataGenerators'

export type PpudSentenceDataOptions = {
  offenceDescription?: string
  offenceDescriptionComment?: string
  releaseDate?: Date
  sentencingCourt?: string
  dateOfSentence?: Date
}

export const PpudSentenceDataGenerator: DataGenerator<PpudSentenceData, AnyNoneOrOption<PpudSentenceDataOptions>> = {
  generate: (options?: AnyNoneOrOption<PpudSentenceDataOptions>) => {
    if (options === 'any') {
      return {
        offenceDescription: faker.lorem.sentence(),
        offenceDescriptionComment: null,
        releaseDate: faker.date.future().toISOString(),
        sentencingCourt: `${faker.location.city()} Court`,
        dateOfSentence: faker.date.past().toISOString(),
      }
    }
    if (!options || options === 'none') {
      return undefined
    }
    return {
      offenceDescription: options.offenceDescription,
      offenceDescriptionComment: options.offenceDescriptionComment,
      releaseDate: options.releaseDate?.toISOString(),
      sentencingCourt: options.sentencingCourt ?? `${faker.location.city()} Court`,
      dateOfSentence: options.dateOfSentence?.toISOString(),
    }
  },
}
