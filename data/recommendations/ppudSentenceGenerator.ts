import { fakerEN_GB as faker } from '@faker-js/faker'
import { PpudSentence } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'
import { DataGeneratorWithSeries } from '../@generators/dataGenerators'
import { CustodyType } from '../../server/helpers/ppudSentence/custodyTypes'
import { PpudOffenceGenerator, PpudOffenceOptions } from './ppudOffenceGenerator'
import { PpudSentenceLengthGenerator, PpudSentenceLengthOptions } from './ppudSentenceLengthGenerator'

export type PpudSentenceOptions = {
  id?: string
  custodyType?: CustodyType
  offence?: PpudOffenceOptions
  releaseDate?: Date
  sentenceLength?: PpudSentenceLengthOptions
  dateOfSentence?: Date
  sentencingCourt?: string
}

const generateInternal: (options?: PpudSentenceOptions) => PpudSentence = (options?) => ({
  id: options.id ?? faker.number.int().toString(),
  sentenceExpiryDate: faker.date.future().toISOString(),
  dateOfSentence: (options.dateOfSentence ?? faker.date.past()).toISOString(),
  custodyType: options?.custodyType ?? 'Determinate',
  mappaLevel: 'MAPPA_LEVEL',
  licenceExpiryDate: faker.date.future().toISOString(),
  offence: PpudOffenceGenerator.generate(options?.offence),
  releaseDate: (options.releaseDate ?? faker.date.future()).toISOString(),
  sentenceLength: PpudSentenceLengthGenerator.generate(options?.sentenceLength),
  sentencingCourt: options.sentencingCourt ?? `${faker.location.city()} Court`,
})

export const PpudSentenceGenerator: DataGeneratorWithSeries<PpudSentence, PpudSentenceOptions> = {
  generate: options => generateInternal(options),
  generateSeries: optionsSeries => optionsSeries.map(options => generateInternal(options)),
}
