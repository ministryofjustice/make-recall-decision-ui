/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ActiveRecommendation } from './ActiveRecommendation';
import type { ConvictionResponse } from './ConvictionResponse';
import type { PersonDetails } from './PersonDetails';
import type { UserAccessResponse } from './UserAccessResponse';

export type LicenceConditionsResponse = {
    userAccessResponse?: UserAccessResponse;
    personalDetailsOverview?: PersonDetails;
    convictions?: Array<ConvictionResponse>;
    activeRecommendation?: ActiveRecommendation;
};

