import { fakerEN_GB as faker } from '@faker-js/faker'
import { DataGeneratorWithSeries } from '../@generators/dataGenerators'
import { PrisonSentence } from '../../server/@types/make-recall-decision-api/models/PrisonSentence'
import { SentenceOffenceGenerator, SentenceOffenceOptions } from './sentenceOffenceGenerator'
import { TermGenerator, TermOptions } from '../common/termGenerator'

type SentenceTypeOption = 'Determinate' | 'Indeterminate' | 'Any' | 'None'

export type PrisonSentenceOptions = {
  lineSequence?: number
  sentenceSequence?: number
  sentenceType?: SentenceTypeOption
  sentenceEndDate?: string
  terms?: TermOptions[]
  offences?: SentenceOffenceOptions[]
}

const determinateType = 'CJA03 Test Determinate'
const indeterminateType = 'CJA03 Test Indeterminate'
const resolveSentenceType = (option?: SentenceTypeOption) => {
  switch (option) {
    case 'Determinate':
      return determinateType
    case 'Indeterminate':
      return indeterminateType
    case 'None':
      return undefined
    case 'Any':
    case undefined:
    default:
      return faker.helpers.arrayElement([determinateType, indeterminateType])
  }
}

const generateInternal = (options?: PrisonSentenceOptions): PrisonSentence => ({
  bookingId: faker.number.int(),
  sentenceSequence: options?.sentenceSequence ?? faker.number.int(),
  lineSequence: options?.lineSequence ?? faker.number.int(),
  caseSequence: faker.number.int(),
  courtDescription: `${faker.location.city()} Court`,
  sentenceStatus: faker.lorem.word(),
  sentenceCategory: faker.lorem.word(),
  sentenceCalculationType: faker.lorem.word(),
  sentenceTypeDescription: resolveSentenceType(options?.sentenceType),
  sentenceDate: faker.date.past().toDateString(),
  sentenceStartDate: faker.date.past().toDateString(),
  sentenceEndDate: options?.sentenceEndDate,
  sentenceSequenceExpiryDate: faker.date.future().toDateString(),
  terms: TermGenerator.generateSeries(options?.terms ?? [{ chronos: 'all' }]),
  offences: SentenceOffenceGenerator.generateSeries(options?.offences ?? [{}]),
  releaseDate: faker.date.future().toDateString(),
  releasingPrison: `HMPPS ${faker.location.city()} Example`,
  licenceExpiryDate: faker.date.past().toDateString(),
})

export const PrisonSentenceGenerator: DataGeneratorWithSeries<PrisonSentence, PrisonSentenceOptions> = {
  generate: options => generateInternal(options),
  generateSeries: optionsSeries => optionsSeries.map(s => generateInternal(s)),
}
