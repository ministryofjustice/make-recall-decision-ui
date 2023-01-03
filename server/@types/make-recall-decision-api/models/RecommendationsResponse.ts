/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ActiveRecommendation } from './ActiveRecommendation';
import type { PersonDetails } from './PersonDetails';
import type { RecommendationsListItem } from './RecommendationsListItem';
import type { UserAccessResponse } from './UserAccessResponse';

export type RecommendationsResponse = {
    userAccessResponse?: UserAccessResponse;
    personalDetailsOverview?: PersonDetails;
    recommendations?: Array<RecommendationsListItem>;
    activeRecommendation?: ActiveRecommendation;
};

