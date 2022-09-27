/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RecallType } from './RecallType';

export type ActiveRecommendation = {
    recommendationId?: number;
    lastModifiedDate?: string;
    lastModifiedBy?: string;
    recallType?: RecallType;
};

