import { faker } from '@faker-js/faker/locale/en_GB'
import { RiskOfSeriousHarm, RiskTo } from '../../../server/@types/make-recall-decision-api'
import { DataGenerator } from '../../@generators/dataGenerators'
import { RiskToGenerator } from './riskToGenerator'

export type RiskOfSeriousHarmOptions = {
  overallRisk?: string
  riskInCustody?: RiskTo
  riskInCommunity?: RiskTo
}

export const RiskOfSeriousHarmGenerator: DataGenerator<RiskOfSeriousHarm, RiskOfSeriousHarmOptions> = {
  generate: options => ({
    overallRisk: options?.overallRisk ?? faker.lorem.sentence(),
    riskInCustody: options?.riskInCustody ?? RiskToGenerator.generate(),
    riskInCommunity: options?.riskInCommunity ?? RiskToGenerator.generate(),
  }),
}
