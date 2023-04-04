/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type {ActiveRecommendation} from './ActiveRecommendation';
import type {PersonDetails} from './PersonDetails';
import type {UserAccessResponse} from './UserAccessResponse';
import type {Conviction} from "./Conviction";

export type LicenceConditionsResponse = {
    userAccessResponse?: UserAccessResponse;
    personalDetailsOverview?: PersonDetails;
    activeConvictions?: Array<Conviction>;
    activeRecommendation?: ActiveRecommendation;
};

