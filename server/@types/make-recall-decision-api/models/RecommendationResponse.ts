/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AlternativesToRecallTried } from './AlternativesToRecallTried';
import type { CustodyStatus } from './CustodyStatus';
import type { LicenceConditionsBreached } from './LicenceConditionsBreached';
import type { LocalPoliceContact } from './LocalPoliceContact';
import type { PersonOnProbation } from './PersonOnProbation';
import type { RecallType } from './RecallType';
import type { SelectedWithDetails } from './SelectedWithDetails';
import type { UnderIntegratedOffenderManagement } from './UnderIntegratedOffenderManagement';
import type { VictimsInContactScheme } from './VictimsInContactScheme';
import type { Vulnerabilities } from './Vulnerabilities';

export type RecommendationResponse = {
    id?: number;
    status?: RecommendationResponse.status;
    custodyStatus?: CustodyStatus;
    localPoliceContact?: LocalPoliceContact;
    crn?: string;
    recallType?: RecallType;
    responseToProbation?: string;
    whatLedToRecall?: string;
    isThisAnEmergencyRecall?: boolean;
    hasVictimsInContactScheme?: VictimsInContactScheme;
    dateVloInformed?: string;
    hasArrestIssues?: SelectedWithDetails;
    hasContrabandRisk?: SelectedWithDetails;
    personOnProbation?: PersonOnProbation;
    alternativesToRecallTried?: AlternativesToRecallTried;
    licenceConditionsBreached?: LicenceConditionsBreached;
    isUnderIntegratedOffenderManagement?: UnderIntegratedOffenderManagement;
    vulnerabilities?: Vulnerabilities;
};

export namespace RecommendationResponse {

    export enum status {
        DRAFT = 'DRAFT',
        DOCUMENT_CREATED = 'DOCUMENT_CREATED',
        DELETED = 'DELETED',
    }


}

