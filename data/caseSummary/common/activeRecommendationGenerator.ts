import { faker } from '@faker-js/faker/locale/en_GB'
import { ActiveRecommendation } from '../../../server/@types/make-recall-decision-api/models/ActiveRecommendation'
import { RecallTypeGenerator, RecallTypeOptions } from '../../recommendations/recallTypeGenerator'
import { RecallConsideredGenerator, RecallConsideredOptions } from './recallConsideredGenerator'
import { ManagerRecallDecisionGenerator, ManagerRecallDecisionOptions } from './managerRecallDecisionGenerator'
import { DataGenerator } from '../../@generators/dataGenerators'

export type ActiveRecommendationOptions = {
  recommendationId?: number
  lastModifiedDate?: string
  lastModifiedBy?: string
  lastModifiedByName?: string
  recallType?: RecallTypeOptions
  recallConsideredList?: RecallConsideredOptions[]
  status?: ActiveRecommendation.status
  managerRecallDecision?: ManagerRecallDecisionOptions
}

export const ActiveRecommendationGenerator: DataGenerator<ActiveRecommendation, ActiveRecommendationOptions> = {
  generate: options => ({
    recommendationId: options?.recommendationId ?? faker.number.int(),
    lastModifiedDate: options?.lastModifiedDate ?? faker.date.past().toISOString(),
    lastModifiedBy: options?.lastModifiedBy ?? faker.internet.username(),
    lastModifiedByName: options?.lastModifiedByName ?? faker.person.fullName(),
    recallType: RecallTypeGenerator.generate(options?.recallType),
    recallConsideredList: RecallConsideredGenerator.generateSeries(options?.recallConsideredList),
    status: options?.status ?? faker.helpers.enumValue(ActiveRecommendation.status),
    managerRecallDecision: ManagerRecallDecisionGenerator.generate(options?.managerRecallDecision),
  }),
}
