/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ActiveRecommendation } from './ActiveRecommendation';
import type { Mappa } from './Mappa';
import type { PredictorScores } from './PredictorScores';
import type { RiskPersonalDetails } from './RiskPersonalDetails';
import type { RoshSummary } from './RoshSummary';
import type { UserAccessResponse } from './UserAccessResponse';

export type RiskResponse = {
    userAccessResponse?: UserAccessResponse;
    personalDetailsOverview?: RiskPersonalDetails;
    roshSummary?: RoshSummary;
    mappa?: Mappa;
    predictorScores?: PredictorScores;
    activeRecommendation?: ActiveRecommendation;
    assessmentStatus?: string;
};

