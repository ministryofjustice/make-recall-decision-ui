/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AlternativesToRecallTried } from './AlternativesToRecallTried';
import type { CustodyStatus } from './CustodyStatus';
import type { IndeterminateSentenceType } from './IndeterminateSentenceType';
import type { LicenceConditionsBreached } from './LicenceConditionsBreached';
import type { LocalPoliceContact } from './LocalPoliceContact';
import type { PersonOnProbation } from './PersonOnProbation';
import type { RecallType } from './RecallType';
import type { SelectedWithDetails } from './SelectedWithDetails';
import type { UnderIntegratedOffenderManagement } from './UnderIntegratedOffenderManagement';
import type { UserAccessResponse } from './UserAccessResponse';
import type { VictimsInContactScheme } from './VictimsInContactScheme';
import type { Vulnerabilities } from './Vulnerabilities';
import { IndeterminateOrExtendedSentenceDetails } from './IndeterminateOrExtendedSentenceDetails'
import { WhyConsideredRecall } from './WhyConsideredRecall'

export type RecommendationResponse = {
    userAccessResponse?: UserAccessResponse;
    id?: number;
    status?: RecommendationResponse.status;
    custodyStatus?: CustodyStatus;
    localPoliceContact?: LocalPoliceContact;
    crn?: string;
    recallType?: RecallType;
    responseToProbation?: string;
    whatLedToRecall?: string;
    isThisAnEmergencyRecall?: boolean;
    isDeterminateSentence?: boolean;
    isIndeterminateSentence?: boolean;
    isExtendedSentence?: boolean;
    fixedTermAdditionalLicenceConditions?: SelectedWithDetails;
    activeCustodialConvictionCount?: number;
    hasVictimsInContactScheme?: VictimsInContactScheme;
    indeterminateSentenceType?: IndeterminateSentenceType;
    dateVloInformed?: string;
    hasArrestIssues?: SelectedWithDetails;
    hasContrabandRisk?: SelectedWithDetails;
    personOnProbation?: PersonOnProbation;
    alternativesToRecallTried?: AlternativesToRecallTried;
    indeterminateOrExtendedSentenceDetails?: IndeterminateOrExtendedSentenceDetails;
    licenceConditionsBreached?: LicenceConditionsBreached;
    isUnderIntegratedOffenderManagement?: UnderIntegratedOffenderManagement;
    vulnerabilities?: Vulnerabilities;
    whyConsideredRecall?: WhyConsideredRecall;
};

export namespace RecommendationResponse {

    export enum status {
        DRAFT = 'DRAFT',
        DOCUMENT_CREATED = 'DOCUMENT_CREATED',
        DELETED = 'DELETED',
    }


}

