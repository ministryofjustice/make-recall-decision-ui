/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ManagerRecallDecision } from './ManagerRecallDecision';
import type { RecallConsidered } from './RecallConsidered';
import type { RecallType } from './RecallType';

export type ActiveRecommendation = {
    recommendationId?: number;
    lastModifiedDate?: string;
    lastModifiedBy?: string;
    lastModifiedByName?: string;
    recallType?: RecallType;
    recallConsideredList?: Array<RecallConsidered>;
    status?: ActiveRecommendation.status;
    managerRecallDecision?: ManagerRecallDecision;
};

export namespace ActiveRecommendation {

    export enum status {
        DRAFT = 'DRAFT',
        DELETED = 'DELETED',
        RECALL_CONSIDERED = 'RECALL_CONSIDERED',
        DOCUMENT_DOWNLOADED = 'DOCUMENT_DOWNLOADED',
    }


}

