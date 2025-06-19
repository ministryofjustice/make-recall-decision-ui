import { faker } from '@faker-js/faker'
import { OfferedOffence } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'
import { DataGeneratorWithSeries } from '../@generators/dataGenerators'
import { TermGenerator, TermOptions } from '../common/termGenerator'

export type OfferedOffenceOptions = {
  offenderChargeId?: number
  terms?: TermOptions[]
}

const generateInternal = (options?: OfferedOffenceOptions) => ({
  offenderChargeId: options?.offenderChargeId ?? faker.number.int(),
  offenceCode: faker.helpers.replaceSymbols('??#####'),
  offenceStatute: faker.lorem.words(),
  offenceDescription: faker.lorem.sentence(),
  offenceDate: faker.date.past().toISOString(),
  sentenceDate: faker.date.past().toISOString(),
  courtDescription: `${faker.location.city()} Court`,
  sentenceStartDate: faker.date.past().toISOString(),
  sentenceEndDate: faker.date.future().toISOString(),
  bookingId: faker.number.int(),
  terms: TermGenerator.generateSeries(options?.terms ?? [{ chronos: 'all' }]),
  releaseDate: faker.date.future().toISOString(),
  releasingPrison: `HMP ${faker.location.city()}`,
  licenceExpiryDate: faker.date.future().toISOString(),
})

export const OfferenceOffenceGenerator: DataGeneratorWithSeries<OfferedOffence, OfferedOffenceOptions> = {
  generate: (options?) => generateInternal(options),
  generateSeries: optionsSeries => optionsSeries.map(options => generateInternal(options)),
}
