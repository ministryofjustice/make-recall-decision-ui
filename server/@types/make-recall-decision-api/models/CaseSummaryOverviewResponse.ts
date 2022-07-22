/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ActiveRecommendation } from './ActiveRecommendation';
import type { Offence } from './Offence';
import type { PersonDetails } from './PersonDetails';
import type { Risk } from './Risk';
import type { UserAccessResponse } from './UserAccessResponse';

export type CaseSummaryOverviewResponse = {
    userAccessResponse?: UserAccessResponse;
    personalDetailsOverview?: PersonDetails;
    offences?: Array<Offence>;
    risk?: Risk;
    activeRecommendation?: ActiveRecommendation;
};
