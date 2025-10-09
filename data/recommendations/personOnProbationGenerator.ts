import { fakerEN_GB as faker } from '@faker-js/faker'
import type { PersonOnProbationDto } from '../../server/@types/make-recall-decision-api'
import { AnyNoneOrOption, DataGenerator } from '../@generators/dataGenerators'
import { mappaGenerator, MappaOptions } from '../common/mappaGenerator'
import { addressGenerator, AddressOptions } from '../common/addressGenerator'

export type PersonOnProbationOptions = {
  fullName?: string
  name?: string
  firstName?: string
  surname?: string
  middleNames?: string
  gender?: string
  ethnicity?: string
  dateOfBirth?: string
  croNumber?: string
  mostRecentPrisonerNumber?: string
  nomsNumber?: string
  pncNumber?: string
  mappa?: AnyNoneOrOption<MappaOptions>
  addresses?: Array<AnyNoneOrOption<AddressOptions>>
  primaryLanguage?: string
  hasBeenReviewed?: boolean
}

export const personOnProbationGenerator: DataGenerator<
  PersonOnProbationDto,
  AnyNoneOrOption<PersonOnProbationOptions>
> = {
  generate: (options?: AnyNoneOrOption<PersonOnProbationOptions>) => {
    if (options === 'any') {
      return {
        name: faker.person.fullName(),
        firstName: faker.person.firstName(),
        surname: faker.person.lastName(),
        middleNames: '',
        fullName: faker.person.fullName(),
        gender: faker.person.sex(),
        ethnicity: 'White British',
        croNumber: faker.helpers.replaceSymbols('####'),
        mostRecentPrisonerNumber: faker.helpers.replaceSymbols('###'),
        nomsNumber: faker.helpers.replaceSymbols('?#####'),
        pncNumber: faker.helpers.replaceSymbols('####/#####'),
        primaryLanguage: 'English',
        mappa: {
          level: 0,
          category: 0,
          lastUpdatedDate: faker.date.past().toDateString(),
        },
        addresses: [
          {
            line1: faker.location.streetAddress(),
            town: faker.location.city(),
            postcode: faker.location.zipCode(),
            noFixedAbode: faker.datatype.boolean(),
          },
        ],
        hasBeenReviewed: faker.datatype.boolean(),
      }
    }

    if (!options || options === 'none') {
      return undefined
    }

    return {
      fullName: options.fullName,
      name: options.name,
      firstName: options.firstName,
      surname: options.surname,
      middleNames: options.middleNames,
      gender: options.gender,
      ethnicity: options.ethnicity,
      dateOfBirth: options.dateOfBirth,
      croNumber: options.croNumber,
      mostRecentPrisonerNumber: options.mostRecentPrisonerNumber,
      nomsNumber: options.nomsNumber,
      pncNumber: options.pncNumber,
      mappa: mappaGenerator.generate(options.mappa ?? 'any'),
      addresses: addressGenerator.generateSeries(options.addresses ?? ['any']),
      primaryLanguage: options.primaryLanguage,
      hasBeenReviewed: options.hasBeenReviewed,
    }
  },
}
