import { fakerEN_GB as faker } from '@faker-js/faker'
import { DataGenerator } from '../@generators/dataGenerators'
import { PrisonOffender } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'

export type PrisonOffenderOptions = {
  image?: string
  locationDescription?: string
  bookingNo?: string
  facialImageId?: number
  firstName?: string
  middleName?: string
  lastName?: string
  dateOfBirth?: string
  agencyId?: string
  agencyDescription?: string
  status?: string
  gender?: string
  ethnicity?: string
  cro?: string
  pnc?: string
  releaseDate?: string
}

export const PrisonOffenderGenerator: DataGenerator<PrisonOffender, PrisonOffenderOptions> = {
  generate: options => {
    return {
      image: options?.image ?? faker.image.avatar(),
      locationDescription: options?.locationDescription ?? faker.location.city(),
      bookingNo: options?.bookingNo ?? faker.string.uuid(),
      facialImageId: options?.facialImageId ?? faker.number.int(),
      firstName: options?.firstName ?? faker.person.firstName(),
      middleName: options?.middleName ?? faker.person.middleName(),
      lastName: options?.lastName ?? faker.person.lastName(),
      dateOfBirth: options?.dateOfBirth ?? faker.date.birthdate().toDateString(),
      agencyId: options?.agencyId ?? faker.string.uuid(),
      agencyDescription: options?.agencyDescription ?? faker.location.city(),
      status: options?.status ?? faker.lorem.word(),
      gender: options?.gender ?? faker.person.gender(),
      ethnicity: options?.ethnicity ?? faker.lorem.word(),
      cro: options?.cro ?? faker.number.int().toString(),
      pnc: options?.pnc ?? faker.number.int().toString(),
      releaseDate: options?.releaseDate ?? faker.date.past().toDateString(),
    }
  },
}
