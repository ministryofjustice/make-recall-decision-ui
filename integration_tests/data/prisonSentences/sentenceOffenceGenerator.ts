import { fakerEN_GB as faker } from '@faker-js/faker'
import { SentenceOffence } from '../../../server/@types/make-recall-decision-api/models/PrisonSentence'
import { DataGeneratorWithSeries } from '../@generators/dataGenerators'

export type SentenceOffenceOptions = {
  numOfIndicators?: number
}

const generateInternal = (options?: SentenceOffenceOptions): SentenceOffence => ({
  offenderChargeId: faker.number.int(),
  offenceStartDate: faker.date.past().toDateString(),
  offenceStatute: faker.lorem.words(),
  offenceCode: faker.helpers.replaceSymbols('??#####'),
  offenceDescription: faker.lorem.sentence(),
  indicators: options?.numOfIndicators ? Array.from(Array(options?.numOfIndicators)).map(() => faker.lorem.word()) : [],
})

export const SentenceOffenceGenerator: DataGeneratorWithSeries<SentenceOffence, SentenceOffenceOptions> = {
  generate: (options?) => generateInternal(options),
  generateSeries: optionsSeries => optionsSeries.map(s => generateInternal(s)),
}
