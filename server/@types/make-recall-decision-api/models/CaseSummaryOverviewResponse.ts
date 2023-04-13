/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ActiveRecommendation } from './ActiveRecommendation';
import type { Conviction } from './Conviction';
import type { PersonDetails } from './PersonDetails';
import type { Release } from './Release';
import type { Risk } from './Risk';
import type { UserAccessResponse } from './UserAccessResponse';

export type CaseSummaryOverviewResponse = {
    userAccessResponse?: UserAccessResponse;
    personalDetailsOverview?: PersonDetails;
    activeConvictions?: Array<Conviction>;
    lastRelease?: Release;
    risk?: Risk;
    activeRecommendation?: ActiveRecommendation;
};

