import { faker } from '@faker-js/faker'
import { DataGenerator } from '../@generators/dataGenerators'
import { PpudOffender } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'
import { PpudSentenceGenerator, PpudSentenceOptions } from './ppudSentenceGenerator'

export type PpudOffenderOptions = {
  sentences?: PpudSentenceOptions[]
}

export const PpudOffenderGenerator: DataGenerator<PpudOffender, PpudOffenderOptions> = {
  generate: options => ({
    id: faker.string.alphanumeric(),
    croOtherNumber: faker.number.int().toString(),
    dateOfBirth: faker.date.past().toISOString(),
    ethnicity: faker.string.alpha(),
    familyName: faker.person.lastName(),
    firstNames: faker.person.firstName(),
    gender: faker.string.alpha(),
    immigrationStatus: faker.string.alpha(),
    establishment: faker.string.alpha(),
    nomsId: faker.number.int().toString(),
    prisonerCategory: faker.string.alpha(),
    prisonNumber: faker.number.int().toString(),
    sentences: PpudSentenceGenerator.generateSeries(options?.sentences ?? [{}, {}, {}]),
    status: faker.string.alpha(),
    youngOffender: faker.datatype.boolean().toString(),
  }),
}
