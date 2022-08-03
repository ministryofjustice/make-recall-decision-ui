/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CustodyStatus } from './CustodyStatus';
import type { RecallType } from './RecallType';

export type UpdateRecommendationRequest = {
    recallType?: RecallType;
    status?: UpdateRecommendationRequest.status;
    custodyStatus?: CustodyStatus;
};

export namespace UpdateRecommendationRequest {

    export enum status {
        DRAFT = 'DRAFT',
        DOCUMENT_CREATED = 'DOCUMENT_CREATED',
        DELETED = 'DELETED',
    }


}
