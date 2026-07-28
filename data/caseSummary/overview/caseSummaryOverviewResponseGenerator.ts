import type { CaseSummaryOverviewResponse } from '../../../server/@types/make-recall-decision-api'
import { PersonDetailsGenerator, PersonDetailsOptions } from '../common/personDetailsGenerator'
import { ConvictionGenerator, ConvictionOptions } from '../common/convictionGenerator'
import { ReleaseGenerator, ReleaseOptions } from './releaseGenerator'
import { DataGenerator } from '../../@generators/dataGenerators'
import { RiskGenerator, RiskOptions } from './riskGenerator'
import { ActiveRecommendationGenerator, ActiveRecommendationOptions } from '../common/activeRecommendationGenerator'

export type CaseSummaryOverviewResponseOptions = {
  personalDetailsOverview?: PersonDetailsOptions
  activeConvictions?: ConvictionOptions[]
  lastRelease?: ReleaseOptions
  risk?: RiskOptions
  activeRecommendation?: ActiveRecommendationOptions
}

export const CaseSummaryOverviewResponseGenerator: DataGenerator<
  CaseSummaryOverviewResponse,
  CaseSummaryOverviewResponseOptions
> = {
  generate: options => ({
    personalDetailsOverview: PersonDetailsGenerator.generate(options?.personalDetailsOverview),
    activeConvictions: ConvictionGenerator.generateSeries(options?.activeConvictions),
    lastRelease: ReleaseGenerator.generate(options?.lastRelease),
    risk: RiskGenerator.generate(options?.risk),
    activeRecommendation: ActiveRecommendationGenerator.generate(options?.activeRecommendation),
  }),
}
