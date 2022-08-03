/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ActiveRecommendation } from './ActiveRecommendation';
import type { OverviewConvictionResponse } from './OverviewConvictionResponse';
import type { PersonDetails } from './PersonDetails';
import type { ReleaseSummaryResponse } from './ReleaseSummaryResponse';
import type { Risk } from './Risk';
import type { UserAccessResponse } from './UserAccessResponse';

export type CaseSummaryOverviewResponse = {
    userAccessResponse?: UserAccessResponse;
    personalDetailsOverview?: PersonDetails;
    convictions?: Array<OverviewConvictionResponse>;
    releaseSummary?: ReleaseSummaryResponse;
    risk?: Risk;
    activeRecommendation?: ActiveRecommendation;
};
