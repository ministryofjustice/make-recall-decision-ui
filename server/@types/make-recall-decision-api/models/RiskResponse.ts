/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ActiveRecommendation } from './ActiveRecommendation';
import type { Mappa } from './Mappa';
import type { PersonDetails } from './PersonDetails';
import type { PredictorScores } from './PredictorScores';
import type { RoshHistory } from './RoshHistory';
import type { RoshSummary } from './RoshSummary';
import type { UserAccessResponse } from './UserAccessResponse';

export type RiskResponse = {
    userAccessResponse?: UserAccessResponse;
    personalDetailsOverview?: PersonDetails;
    roshSummary?: RoshSummary;
    roshHistory?: RoshHistory;
    mappa?: Mappa;
    predictorScores?: PredictorScores;
    activeRecommendation?: ActiveRecommendation;
    assessmentStatus?: string;
};

