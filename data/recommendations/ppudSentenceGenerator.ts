import { faker } from '@faker-js/faker'
import { DataGeneratorWithSeries } from '../@generators/dataGenerators'
import { PpudSentence } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'
import { PpudOffenceGenerator, PpudOffenceOptions } from './ppudOffenceGenerator'
import { PpudSentenceLengthGenerator, PpudSentenceLengthOptions } from './ppudSentenceLengthGenerator'

export type PpudSentenceOptions = {
  offence?: PpudOffenceOptions
  sentenceLength?: PpudSentenceLengthOptions
}

const generate = (options?: PpudSentenceOptions): PpudSentence => ({
  id: faker.string.alphanumeric(),
  sentenceExpiryDate: faker.date.future().toISOString(),
  dateOfSentence: faker.date.past().toISOString(),
  custodyType: faker.lorem.word(),
  mappaLevel: faker.string.alphanumeric(),
  licenceExpiryDate: faker.date.past().toISOString(),
  offence: PpudOffenceGenerator.generate(options?.offence),
  releaseDate: faker.date.past().toISOString(),
  sentenceLength: PpudSentenceLengthGenerator.generate(options?.sentenceLength),
  sentencingCourt: faker.lorem.sentence(3),
})

export const PpudSentenceGenerator: DataGeneratorWithSeries<PpudSentence, PpudSentenceOptions> = {
  generate,
  generateSeries: optionsSeries => optionsSeries.map(option => generate(option)),
}
