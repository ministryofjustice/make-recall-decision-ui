import { faker } from '@faker-js/faker/locale/en_GB'
import { RiskOfSeriousHarm, RoshSummary } from '../../../server/@types/make-recall-decision-api'
import { DataGenerator } from '../../@generators/dataGenerators'
import { RiskOfSeriousHarmGenerator } from './riskOfSeriousHarmGenerator'

export type RoshSummaryOptions = {
  natureOfRisk?: string
  whoIsAtRisk?: string
  riskIncreaseFactors?: string
  riskMitigationFactors?: string
  riskImminence?: string
  riskOfSeriousHarm?: RiskOfSeriousHarm
  lastUpdatedDate?: string
  error?: string
}

export const RoshSummaryGenerator: DataGenerator<RoshSummary, RoshSummaryOptions> = {
  generate: options => ({
    natureOfRisk: options?.natureOfRisk ?? faker.lorem.sentence(),
    whoIsAtRisk: options?.whoIsAtRisk ?? faker.lorem.sentence(),
    riskIncreaseFactors: options?.riskIncreaseFactors ?? faker.lorem.sentence(),
    riskMitigationFactors: options?.riskMitigationFactors ?? faker.lorem.sentence(),
    riskImminence: options?.riskImminence ?? faker.lorem.sentence(),
    riskOfSeriousHarm: options?.riskOfSeriousHarm ?? RiskOfSeriousHarmGenerator.generate(),
    lastUpdatedDate: options?.lastUpdatedDate ?? faker.date.past().toISOString(),
    error: options?.error ?? faker.lorem.sentence(),
  }),
}
