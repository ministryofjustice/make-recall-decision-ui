import { faker } from '@faker-js/faker/locale/en_GB'
import { DataGenerator } from '../../@generators/dataGenerators'
import { RiskManagementPlan } from '../../../server/@types/make-recall-decision-api'

export type RiskManagementPlanOptions = {
  assessmentStatusComplete?: boolean
  lastUpdatedDate?: string
  latestDateCompleted?: string
  initiationDate?: string
  contingencyPlans?: string
  error?: string
}

export const RiskManagementPlanGenerator: DataGenerator<RiskManagementPlan, RiskManagementPlanOptions> = {
  generate: options => ({
    assessmentStatusComplete: options?.assessmentStatusComplete ?? faker.datatype.boolean(),
    lastUpdatedDate: options?.lastUpdatedDate ?? faker.date.past().toISOString(),
    latestDateCompleted: options?.latestDateCompleted ?? faker.date.past().toISOString(),
    initiationDate: options?.initiationDate ?? faker.date.past().toISOString(),
    contingencyPlans: options?.contingencyPlans ?? faker.lorem.sentence(),
    error: options?.error ?? faker.lorem.sentence(),
  }),
}
