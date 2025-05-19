import { fakerEN_GB as faker } from '@faker-js/faker'
import { BookRecallToPpud } from '../../../server/@types/make-recall-decision-api/models/RecommendationResponse'
import { DataGenerator, AnyNoneOrOption } from '../@generators/dataGenerators'
import { CUSTODY_GROUP } from '../../../server/@types/make-recall-decision-api/models/ppud/CustodyGroup'
import { resolveAnyNoneOrOption } from '../@generators/dataGenerator.utils'

export const ETHNICITIES = {
  'Asian or Asian British - Bangladeshi': 'Asian or Asian British - Bangladeshi',
  'Asian or Asian British - Indian': 'Asian or Asian British - Indian',
  'Asian or Asian British - Other': 'Asian or Asian British - Other',
  'Asian or Asian British - Pakistani': 'Asian or Asian British - Pakistani',
  'Black or Black British - Africa': 'Black or Black British - Africa',
  'Black or Black British - Caribbean': 'Black or Black British - Caribbean',
  'Black or Black British - Other': 'Black or Black British - Other',
  Chinese: 'Chinese',
  'Mixed - Other': 'Mixed - Other',
  'Mixed - White & Asian': 'Mixed - White & Asian',
  'Mixed - White & Black African': 'Mixed - White & Black African',
  'Mixed - White & Black Caribbean': 'Mixed - White & Black Caribbean',
  'Not Applicable': 'Not Applicable',
  'Not Known': 'Not Known',
  'Other Ethnic Group': 'Other Ethnic Group',
  Refusal: 'Refusal',
  'White - British': 'White - British',
  'White - Irish': 'White - Irish',
  'White - Other': 'White - Other',
  'White - Roma': 'White - Roma',
}

export type BookRecallToPpudOptions = {
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  ethnicity?: keyof typeof ETHNICITIES

  custodyGroup?: AnyNoneOrOption<CUSTODY_GROUP>
}

export const BookRecallToPpudGenerator: DataGenerator<BookRecallToPpud, BookRecallToPpudOptions> = {
  generate: options => ({
    firstNames: options?.firstName ?? faker.person.firstName(),
    lastName: options?.lastName ?? faker.person.lastName(),
    dateOfBirth: options?.dateOfBirth ?? faker.date.past().toDateString(),
    ethnicity: options?.ethnicity ?? faker.helpers.objectValue(ETHNICITIES),

    ...(options?.custodyGroup ?? false
      ? resolveAnyNoneOrOption<CUSTODY_GROUP>(options.custodyGroup, 'custodyGroup', Object.values(CUSTODY_GROUP))
      : {}),
  }),
}
