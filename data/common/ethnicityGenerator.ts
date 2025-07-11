import { faker } from '@faker-js/faker'
import { DataGenerator } from '../@generators/dataGenerators'

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

export type EthnicityKey = keyof typeof ETHNICITIES

export const EthnicityGenerator: DataGenerator<string, EthnicityKey> = {
  generate: (key?: EthnicityKey) => ETHNICITIES[key] ?? faker.helpers.objectValue(ETHNICITIES),
}
