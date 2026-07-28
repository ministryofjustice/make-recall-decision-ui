import { faker } from '@faker-js/faker/locale/en_GB'
import { RiskTo } from '../../../server/@types/make-recall-decision-api'
import { DataGenerator } from '../../@generators/dataGenerators'

export type RiskToOptions = {
  riskToChildren?: string
  riskToPublic?: string
  riskToKnownAdult?: string
  riskToStaff?: string
  riskToPrisoners?: string
}

export const RiskToGenerator: DataGenerator<RiskTo, RiskToOptions> = {
  generate: options => ({
    riskToChildren: options?.riskToChildren ?? faker.lorem.sentence(),
    riskToPublic: options?.riskToPublic ?? faker.lorem.sentence(),
    riskToKnownAdult: options?.riskToKnownAdult ?? faker.lorem.sentence(),
    riskToStaff: options?.riskToStaff ?? faker.lorem.sentence(),
    riskToPrisoners: options?.riskToPrisoners ?? faker.lorem.sentence(),
  }),
}
