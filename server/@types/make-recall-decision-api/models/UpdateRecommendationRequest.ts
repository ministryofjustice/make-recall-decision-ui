/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CustodyStatus } from './CustodyStatus';
import type { RecallType } from './RecallType';
import type { VictimsInContactScheme } from './VictimsInContactScheme';

export type UpdateRecommendationRequest = {
    recallType?: RecallType;
    status?: UpdateRecommendationRequest.status;
    custodyStatus?: CustodyStatus;
    responseToProbation?: string;
    isThisAnEmergencyRecall?: boolean;
    hasVictimsInContactScheme?: VictimsInContactScheme;
    dateVloInformed?: string;
};

export namespace UpdateRecommendationRequest {

    export enum status {
        DRAFT = 'DRAFT',
        DOCUMENT_CREATED = 'DOCUMENT_CREATED',
        DELETED = 'DELETED',
    }


}
