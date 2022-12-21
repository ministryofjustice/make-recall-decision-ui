/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RecallConsidered } from './RecallConsidered';
import type { RecallType } from './RecallType';

export type ActiveRecommendation = {
    recommendationId?: number;
    lastModifiedDate?: string;
    lastModifiedBy?: string;
    recallType?: RecallType;
    recallConsideredList?: Array<RecallConsidered>;
    status?: ActiveRecommendation.status;
};

export namespace ActiveRecommendation {

    export enum status {
        DRAFT = 'DRAFT',
        DOCUMENT_CREATED = 'DOCUMENT_CREATED',
        DELETED = 'DELETED',
        RECALL_CONSIDERED = 'RECALL_CONSIDERED',
        DOCUMENT_DOWNLOADED = 'DOCUMENT_DOWNLOADED',
    }


}

