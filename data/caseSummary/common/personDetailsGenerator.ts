import { faker } from '@faker-js/faker/locale/en_GB'
import { DataGenerator } from '../../@generators/dataGenerators'
import { PersonDetails } from '../../../server/@types/make-recall-decision-api'

export type PersonDetailsOptions = {
  fullName?: string
  name?: string
  firstName?: string
  middleNames?: string
  surname?: string
  dateOfBirth?: string
  age?: number
  gender?: string
  crn?: string
  ethnicity?: string
  croNumber?: string
  mostRecentPrisonerNumber?: string
  pncNumber?: string
  nomsNumber?: string
  primaryLanguage?: string
}

export const PersonDetailsGenerator: DataGenerator<PersonDetails, PersonDetailsOptions> = {
  generate: options => ({
    fullName: options?.fullName ?? faker.person.fullName(),
    name: options?.name ?? faker.person.fullName(),
    firstName: options?.firstName ?? faker.person.firstName(),
    middleNames: options?.middleNames ?? faker.person.middleName(),
    surname: options?.surname ?? faker.person.middleName(),
    dateOfBirth: options?.dateOfBirth ?? faker.date.past().toDateString(),
    age: options?.age ?? faker.number.int({ min: 18, max: 100 }),
    gender: options?.gender ?? faker.person.gender(),
    crn: options?.crn ?? faker.helpers.replaceSymbols('?######'),
    ethnicity: options?.ethnicity ?? faker.lorem.word(),
    croNumber: options?.croNumber ?? faker.helpers.replaceSymbols('####'),
    mostRecentPrisonerNumber: options?.mostRecentPrisonerNumber ?? faker.helpers.replaceSymbols('###'),
    pncNumber: options?.pncNumber ?? faker.helpers.replaceSymbols('?#####'),
    nomsNumber: options?.nomsNumber ?? faker.helpers.replaceSymbols('####/#####'),
    primaryLanguage: options?.primaryLanguage ?? faker.location.language().name,
  }),
}
