import { fakerEN_GB as faker } from '@faker-js/faker'
import { BookRecallToPpud } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'
import { DataGenerator, AnyNoneOrOption } from '../@generators/dataGenerators'
import { CUSTODY_GROUP } from '../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { resolveAnyNoneOrOption } from '../@generators/dataGenerator.utils'
import { PpudSentenceDataGenerator, PpudSentenceDataOptions } from './ppudSentenceDataGenerator'
import { EthnicityGenerator, EthnicityKey } from '../common/ethnicityGenerator'

export type BookRecallToPpudOptions = {
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  ethnicity?: EthnicityKey

  custodyGroup?: AnyNoneOrOption<CUSTODY_GROUP>
  ppudSentenceId?: string
  ppudSentenceData?: PpudSentenceDataOptions
}

export const BookRecallToPpudGenerator: DataGenerator<BookRecallToPpud, BookRecallToPpudOptions> = {
  generate: options => ({
    firstNames: options?.firstName ?? faker.person.firstName(),
    lastName: options?.lastName ?? faker.person.lastName(),
    dateOfBirth: options?.dateOfBirth ?? faker.date.past().toDateString(),
    ethnicity: EthnicityGenerator.generate(options?.ethnicity),

    ...(options?.custodyGroup ?? false
      ? resolveAnyNoneOrOption<CUSTODY_GROUP>(options.custodyGroup, 'custodyGroup', Object.values(CUSTODY_GROUP))
      : {}),

    ppudSentenceId: options?.ppudSentenceId,
    ppudSentenceData: options?.ppudSentenceData
      ? PpudSentenceDataGenerator.generate(options.ppudSentenceData)
      : undefined,
  }),
}
