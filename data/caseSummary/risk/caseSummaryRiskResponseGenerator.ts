import { RiskResponse } from '../../../server/@types/make-recall-decision-api'
import { DataGenerator } from '../../@generators/dataGenerators'
import { MappaGenerator } from '../../common/mappaGenerator'
import { ActiveRecommendationGenerator, ActiveRecommendationOptions } from '../common/activeRecommendationGenerator'
import { PersonDetailsGenerator, PersonDetailsOptions } from '../common/personDetailsGenerator'
import { MappaOptions } from './mappaGenerator'
import { RoshHistoryGenerator, RoshHistoryOptions } from './roshHistoryGenerator'
import { RoshSummaryGenerator, RoshSummaryOptions } from './roshSummaryGenerator'

export type RiskResponseOptions = {
  personalDetailsOverview?: PersonDetailsOptions
  roshSummary?: RoshSummaryOptions
  roshHistory?: RoshHistoryOptions
  mappa?: MappaOptions
  activeRecommendation?: ActiveRecommendationOptions
}

export const CaseSummaryRiskResponseGenerator: DataGenerator<RiskResponse, RiskResponseOptions> = {
  generate: options => ({
    personalDetailsOverview: PersonDetailsGenerator.generate(options?.personalDetailsOverview),
    roshSummary: RoshSummaryGenerator.generate(options?.roshSummary),
    roshHistory: RoshHistoryGenerator.generate(options?.roshHistory),
    mappa: MappaGenerator.generate(options?.mappa),
    // predictorScores?: PredictorScores; // Skipped this as it's absolutely massive
    activeRecommendation: ActiveRecommendationGenerator.generate(options?.activeRecommendation),
  }),
}
