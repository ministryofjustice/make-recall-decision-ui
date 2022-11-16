/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ActiveRecommendation } from './ActiveRecommendation';
import type { ContactGroupResponse } from './ContactGroupResponse';
import type { ContactSummaryResponse } from './ContactSummaryResponse';
import type { PersonDetails } from './PersonDetails';
import type { UserAccessResponse } from './UserAccessResponse';

export type ContactHistoryResponse = {
    userAccessResponse?: UserAccessResponse;
    personalDetailsOverview?: PersonDetails;
    contactSummary?: Array<ContactSummaryResponse>;
    contactTypeGroups?: Array<ContactGroupResponse>;
    activeRecommendation?: ActiveRecommendation;
};

