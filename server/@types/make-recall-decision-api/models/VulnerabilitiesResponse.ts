/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ActiveRecommendation } from './ActiveRecommendation';
import type { PersonDetails } from './PersonDetails';
import type { UserAccessResponse } from './UserAccessResponse';
import type { Vulnerabilities } from './Vulnerabilities';

export type VulnerabilitiesResponse = {
    userAccessResponse?: UserAccessResponse;
    personalDetailsOverview?: PersonDetails;
    vulnerabilities?: Vulnerabilities;
    activeRecommendation?: ActiveRecommendation;
};

