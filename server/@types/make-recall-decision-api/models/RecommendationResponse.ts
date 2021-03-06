/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RecallType } from './RecallType';

export type RecommendationResponse = {
    id?: number;
    status?: RecommendationResponse.status;
    crn?: string;
    recallType?: RecallType;
};

export namespace RecommendationResponse {

    export enum status {
        DRAFT = 'DRAFT',
        DOCUMENT_CREATED = 'DOCUMENT_CREATED',
    }


}
