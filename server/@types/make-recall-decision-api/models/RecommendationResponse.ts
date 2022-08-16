/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AlternativesToRecallTried } from './AlternativesToRecallTried';
import type { ArrestIssues } from './ArrestIssues';
import type { CustodyStatus } from './CustodyStatus';
import type { PersonOnProbation } from './PersonOnProbation';
import type { RecallType } from './RecallType';
import type { VictimsInContactScheme } from './VictimsInContactScheme';

export type RecommendationResponse = {
    id?: number;
    status?: RecommendationResponse.status;
    custodyStatus?: CustodyStatus;
    crn?: string;
    recallType?: RecallType;
    responseToProbation?: string;
    isThisAnEmergencyRecall?: boolean;
    hasVictimsInContactScheme?: VictimsInContactScheme;
    dateVloInformed?: string;
    hasArrestIssues?: ArrestIssues;
    personOnProbation?: PersonOnProbation;
    alternativesToRecallTried?: AlternativesToRecallTried;
};

export namespace RecommendationResponse {

    export enum status {
        DRAFT = 'DRAFT',
        DOCUMENT_CREATED = 'DOCUMENT_CREATED',
        DELETED = 'DELETED',
    }


}
