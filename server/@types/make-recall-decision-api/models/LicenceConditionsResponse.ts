/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ConvictionResponse } from './ConvictionResponse';
import type { PersonDetails } from './PersonDetails';
import type { ReleaseSummaryResponse } from './ReleaseSummaryResponse';

export type LicenceConditionsResponse = {
    userRestricted?: boolean;
    userExcluded?: boolean;
    exclusionMessage?: string;
    restrictionMessage?: string;
    personalDetailsOverview?: PersonDetails;
    convictions?: Array<ConvictionResponse>;
    releaseSummary?: ReleaseSummaryResponse;
};
