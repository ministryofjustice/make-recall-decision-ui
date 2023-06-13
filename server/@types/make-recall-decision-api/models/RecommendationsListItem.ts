/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RecallType } from './RecallType';
import { RecommendationStatusResponse } from './RecommendationStatusReponse'

export function isRecommendationsListItem(recommendation: any): recommendation is RecommendationsListItem {
    return (recommendation as RecommendationsListItem).statuses !== undefined;
}

export type RecommendationsListItem = {
    recommendationId?: number;
    lastModifiedByName?: string;
    createdDate?: string;
    lastModifiedDate?: string;
    status?: RecommendationsListItem.status;
    statuses?: RecommendationStatusResponse[];
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

