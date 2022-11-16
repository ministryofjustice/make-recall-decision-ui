/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ActiveRecommendation } from './ActiveRecommendation';
import type { LicenceConditionResponse } from './LicenceConditionResponse';
import type { PersonDetails } from './PersonDetails';
import type { UserAccessResponse } from './UserAccessResponse';

export type LicenceConditionsCvlResponse = {
    userAccessResponse?: UserAccessResponse;
    personalDetailsOverview?: PersonDetails;
    licenceConditions?: Array<LicenceConditionResponse>;
    activeRecommendation?: ActiveRecommendation;
};

