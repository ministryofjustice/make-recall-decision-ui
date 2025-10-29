import { fakerEN_GB as faker } from '@faker-js/faker'
import { DataGenerator, IncludeNoneOrOption } from '../@generators/dataGenerators'
import { resolveIncludeNoneOrOption } from '../@generators/dataGenerator.utils'
import { ConvictionDetail } from '../../server/@types/make-recall-decision-api'

export type ConvictionDetailOptions = {
  custodialTerm?: IncludeNoneOrOption<string>
  extendedTerm?: IncludeNoneOrOption<string>
  hasBeenReviewed?: boolean
}

export const ConvictionDetailGenerator: DataGenerator<ConvictionDetail, ConvictionDetailOptions> = {
  generate: (options?) => ({
    indexOffenceDescription: 'Burglary',
    dateOfOriginalOffence: faker.date.past().toDateString(),
    licenceExpiryDate: faker.date.past().toDateString(),
    sentenceExpiryDate: faker.date.past().toDateString(),
    dateOfSentence: faker.date.past().toDateString(),
    lengthOfSentence: faker.number.int({ min: 1, max: 12 }),
    lengthOfSentenceUnits: 'months',
    sentenceDescription: faker.lorem.sentence(),
    custodialTerm: resolveIncludeNoneOrOption(
      options?.custodialTerm ?? 'none',
      () => `${faker.number.int({ min: 1, max: 12 })} months`
    ),
    extendedTerm: resolveIncludeNoneOrOption(
      options?.extendedTerm ?? 'none',
      () => `${faker.number.int({ min: 1, max: 12 })} years`
    ),
    hasBeenReviewed: options?.hasBeenReviewed ?? faker.datatype.boolean(),
  }),
}
