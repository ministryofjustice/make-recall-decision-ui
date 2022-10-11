/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ActiveRecommendation } from './ActiveRecommendation';
import type { CircumstancesIncreaseRisk } from './CircumstancesIncreaseRisk';
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
    roshSummary: {
        riskOfSeriousHarm?: RiskOfSeriousHarm;
        natureOfRisk?: NatureOfRisk;
        whoIsAtRisk?: WhoIsAtRisk;
        riskIncreaseFactors?: CircumstancesIncreaseRisk;
        factorsToReduceRisk?: FactorsToReduceRisk;
        riskImminence?: WhenRiskHighest;
        error?: string;
    }
    mappa?: Mappa;
    predictorScores?: PredictorScores;
    activeRecommendation?: ActiveRecommendation;
};

