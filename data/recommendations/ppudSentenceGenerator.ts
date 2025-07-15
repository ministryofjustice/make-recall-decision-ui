import { fakerEN_GB as faker } from '@faker-js/faker'
import { PpudSentence } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'
import { DataGeneratorWithSeries } from '../@generators/dataGenerators'
import { DeterminateCustody, IndeterminateCustody } from '../../server/helpers/ppudSentence/ppudSentenceHelper'

export type PpudSentenceOptions = {
  id?: string
  custodyType?: DeterminateCustody | IndeterminateCustody
  releaseDate?: Date
}

const generateInternal: (options?: PpudSentenceOptions) => PpudSentence = (options?) => ({
  id: options.id ?? faker.number.int().toString(),
  sentenceExpiryDate: faker.date.future().toISOString(),
  dateOfSentence: faker.date.past().toISOString(),
  custodyType: options?.custodyType ?? 'Determinate',
  mappaLevel: 'MAPPA_LEVEL',
  licenceExpiryDate: faker.date.future().toISOString(),
  offence: {
    indexOffence: faker.lorem.sentence(),
    dateOfIndexOffence: faker.date.past().toISOString(),
  },
  releaseDate: (options.releaseDate ?? faker.date.future()).toISOString(),
  sentenceLength: {
    partYears: faker.number.int({ min: 1, max: 5 }),
    partMonths: faker.number.int({ min: 1, max: 12 }),
    partDays: faker.number.int({ min: 1, max: 28 }),
  },
  sentencingCourt: `${faker.location.city()} Court`,
})

export const PpudSentenceGenerator: DataGeneratorWithSeries<PpudSentence, PpudSentenceOptions> = {
  generate: options => generateInternal(options),
  generateSeries: optionsSeries => optionsSeries.map(options => generateInternal(options)),
}
