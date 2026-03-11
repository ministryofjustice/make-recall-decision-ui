import { faker } from '@faker-js/faker/locale/en_GB'
import type { Risk } from '../../../server/@types/make-recall-decision-api'
import { RiskManagementPlanGenerator, RiskManagementPlanOptions } from './riskManagementPlanGenerator'
import { AssessmentInfoGenerator, AssessmentInfoOptions } from './assessmentInfoGenerator'
import { DataGenerator } from '../../@generators/dataGenerators'

export type RiskOptions = {
  flags?: string[]
  riskManagementPlan?: RiskManagementPlanOptions
  assessments?: AssessmentInfoOptions
}

export const RiskGenerator: DataGenerator<Risk, RiskOptions> = {
  generate: options => ({
    flags: options?.flags ?? faker.helpers.multiple(() => faker.lorem.word()),
    riskManagementPlan: RiskManagementPlanGenerator.generate(options?.riskManagementPlan),
    assessments: AssessmentInfoGenerator.generate(options?.assessments),
  }),
}
