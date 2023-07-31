/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ActiveRecommendation } from './ActiveRecommendation';
import type { PersonDetails } from './PersonDetails';
import type { UserAccessResponse } from './UserAccessResponse';
import { LastCompletedRecommendationsListItem } from './LastCompletedRecommendationsListItem'

export type LastCompletedRecommendationsResponse = {
  userAccessResponse?: UserAccessResponse;
  personalDetailsOverview?: PersonDetails;
  recommendations?: Array<LastCompletedRecommendationsListItem>;
  activeRecommendation?: ActiveRecommendation;
};

