/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CurrentAddress } from './CurrentAddress';
import type { OffenderManager } from './OffenderManager';
import type { PersonDetails } from './PersonDetails';

export type PersonDetailsResponse = {
    userRestricted?: boolean;
    userExcluded?: boolean;
    exclusionMessage?: string;
    restrictionMessage?: string;
    personalDetailsOverview?: PersonDetails;
    currentAddress?: CurrentAddress;
    offenderManager?: OffenderManager;
};
