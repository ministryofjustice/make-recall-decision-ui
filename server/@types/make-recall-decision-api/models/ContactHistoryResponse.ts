/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ContactGroupResponse } from './ContactGroupResponse';
import type { ContactSummaryResponse } from './ContactSummaryResponse';
import type { PersonDetails } from './PersonDetails';
import type { ReleaseSummaryResponse } from './ReleaseSummaryResponse';

export type ContactHistoryResponse = {
    userRestricted?: boolean;
    userExcluded?: boolean;
    exclusionMessage?: string;
    restrictionMessage?: string;
    personalDetailsOverview?: PersonDetails;
    contactSummary?: Array<ContactSummaryResponse>;
    contactTypeGroups?: Array<ContactGroupResponse>;
    releaseSummary?: ReleaseSummaryResponse;
};
