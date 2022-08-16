/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AlternativesToRecallTried } from './AlternativesToRecallTried';
import type { ArrestIssues } from './ArrestIssues';
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
    alternativesToRecallTried?: AlternativesToRecallTried;
    hasArrestIssues?: ArrestIssues;
};

export namespace UpdateRecommendationRequest {

    export enum status {
        DRAFT = 'DRAFT',
        DOCUMENT_CREATED = 'DOCUMENT_CREATED',
        DELETED = 'DELETED',
    }


}
