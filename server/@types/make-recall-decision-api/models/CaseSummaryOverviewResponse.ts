/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ActiveRecommendation } from './ActiveRecommendation';
import type { ConvictionResponse } from './ConvictionResponse';
import type { PersonDetails } from './PersonDetails';
import type { ReleaseSummaryResponse } from './ReleaseSummaryResponse';
import type { Risk } from './Risk';
import type { UserAccessResponse } from './UserAccessResponse';

export type CaseSummaryOverviewResponse = {
    userAccessResponse?: UserAccessResponse;
    personalDetailsOverview?: PersonDetails;
    convictions?: Array<ConvictionResponse>;
    releaseSummary?: ReleaseSummaryResponse;
    risk?: Risk;
    activeRecommendation?: ActiveRecommendation;
};
