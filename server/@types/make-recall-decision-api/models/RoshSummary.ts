/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RiskOfSeriousHarm } from './RiskOfSeriousHarm';

export type RoshSummary = {
    natureOfRisk?: string;
    whoIsAtRisk?: string;
    riskIncreaseFactors?: string;
    riskMitigationFactors?: string;
    riskImminence?: string;
    riskOfSeriousHarm?: RiskOfSeriousHarm;
    lastUpdatedDate?: string;
    error?: string;
};

