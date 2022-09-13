/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ActiveRecommendation } from './ActiveRecommendation';
import type { Address } from './Address';
import type { OffenderManager } from './OffenderManager';
import type { PersonDetails } from './PersonDetails';
import type { UserAccessResponse } from './UserAccessResponse';

export type PersonDetailsResponse = {
    userAccessResponse?: UserAccessResponse;
    personalDetailsOverview?: PersonDetails;
    addresses?: Array<Address>;
    offenderManager?: OffenderManager;
    activeRecommendation?: ActiveRecommendation;
};

