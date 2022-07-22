/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ActiveRecommendation } from './ActiveRecommendation';
import type { CurrentAddress } from './CurrentAddress';
import type { OffenderManager } from './OffenderManager';
import type { PersonDetails } from './PersonDetails';
import type { UserAccessResponse } from './UserAccessResponse';

export type PersonDetailsResponse = {
    userAccessResponse?: UserAccessResponse;
    personalDetailsOverview?: PersonDetails;
    currentAddress?: CurrentAddress;
    offenderManager?: OffenderManager;
    activeRecommendation?: ActiveRecommendation;
};
