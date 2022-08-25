/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ActiveRecommendation } from './ActiveRecommendation';
import type { CircumstancesIncreaseRisk } from './CircumstancesIncreaseRisk';
import type { ContingencyPlan } from './ContingencyPlan';
import type { FactorsToReduceRisk } from './FactorsToReduceRisk';
import type { Mappa } from './Mappa';
import type { NatureOfRisk } from './NatureOfRisk';
import type { PredictorScores } from './PredictorScores';
import type { RiskOfSeriousHarm } from './RiskOfSeriousHarm';
import type { RiskPersonalDetails } from './RiskPersonalDetails';
import type { UserAccessResponse } from './UserAccessResponse';
import type { WhenRiskHighest } from './WhenRiskHighest';
import type { WhoIsAtRisk } from './WhoIsAtRisk';

export type RiskResponse = {
    userAccessResponse?: UserAccessResponse;
    personalDetailsOverview?: RiskPersonalDetails;
    riskOfSeriousHarm?: RiskOfSeriousHarm;
    mappa?: Mappa;
    predictorScores?: PredictorScores;
    natureOfRisk?: NatureOfRisk;
    contingencyPlan?: ContingencyPlan;
    whoIsAtRisk?: WhoIsAtRisk;
    circumstancesIncreaseRisk?: CircumstancesIncreaseRisk;
    factorsToReduceRisk?: FactorsToReduceRisk;
    whenRiskHighest?: WhenRiskHighest;
    activeRecommendation?: ActiveRecommendation;
};

