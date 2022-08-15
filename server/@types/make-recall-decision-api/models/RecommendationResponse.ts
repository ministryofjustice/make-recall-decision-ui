/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CustodyStatus } from './CustodyStatus';
import type { PersonOnProbation } from './PersonOnProbation';
import type { RecallType } from './RecallType';
import { VictimContactScheme } from './VictimContactScheme'

export type RecommendationResponse = {
    id?: number;
    status?: RecommendationResponse.status;
    custodyStatus?: CustodyStatus;
    crn?: string;
    recallType?: RecallType;
    personOnProbation?: PersonOnProbation;
    hasVictimsInContactScheme?: VictimContactScheme;
    responseToProbation?: string;
    isThisAnEmergencyRecall?: boolean;
};

export namespace RecommendationResponse {

    export enum status {
        DRAFT = 'DRAFT',
        DOCUMENT_CREATED = 'DOCUMENT_CREATED',
        DELETED = 'DELETED',
    }


}
