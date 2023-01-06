/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RecallType } from './RecallType';

export type RecommendationsListItem = {
    recommendationId?: number;
    lastModifiedByName?: string;
    createdDate?: string;
    lastModifiedDate?: string;
    status?: RecommendationsListItem.status;
    recallType?: RecallType;
};

export namespace RecommendationsListItem {

    export enum status {
        DRAFT = 'DRAFT',
        DELETED = 'DELETED',
        RECALL_CONSIDERED = 'RECALL_CONSIDERED',
        DOCUMENT_DOWNLOADED = 'DOCUMENT_DOWNLOADED',
    }


}

