/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RecallType } from './RecallType';
import { RecallConsidered } from './RecallConsidered'

export type ActiveRecommendation = {
    recommendationId?: number;
    lastModifiedDate?: string;
    lastModifiedBy?: string;
    recallType?: RecallType;
    recallConsideredList?: RecallConsidered[]
};

