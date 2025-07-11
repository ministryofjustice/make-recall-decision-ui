import { fakerEN_GB as faker } from '@faker-js/faker'
import { PpudOffender } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'
import { DataGenerator } from '../@generators/dataGenerators'
import { PPUDSentenceGenerator, PPUDSentenceOptions } from './ppudSentenceGenerator'
import { EthnicityGenerator, EthnicityKey } from '../common/ethnicityGenerator'

export type PPUDOffenderOptions = {
  id?: string
  ethnicity?: EthnicityKey
  sentences: PPUDSentenceOptions[]
}

export const PPUDOffenderGenerator: DataGenerator<PpudOffender, PPUDOffenderOptions> = {
  generate: (options?: PPUDOffenderOptions) => ({
    id: options.id ?? faker.number.int().toString(),
    croOtherNumber: faker.number.int().toString(),
    dateOfBirth: faker.date.past().toDateString(),
    ethnicity: EthnicityGenerator.generate(options?.ethnicity),
    familyName: faker.person.lastName(),
    firstNames: faker.person.firstName(),
    gender: faker.person.gender(),
    immigrationStatus: faker.lorem.word(),
    establishment: faker.lorem.words(),
    nomsId: faker.number.int().toString(),
    prisonerCategory: faker.lorem.word(),
    prisonNumber: faker.number.int().toString(),
    sentences: PPUDSentenceGenerator.generateSeries(options.sentences ?? [{}, {}, {}]),
    status: faker.lorem.word(),
    youngOffender: `${faker.datatype.boolean()}`,
  }),
}
