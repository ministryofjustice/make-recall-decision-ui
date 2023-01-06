/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import { RecallType } from './RecallType'
import { RecommendationResponse } from './RecommendationResponse'

export type RecommendationsListItem = {
    lastModifiedBy?: string;
    createdDate?: string;
    lastModifiedDate?: string;
    recallType?: RecallType;
    status?: RecommendationResponse.status;
};
