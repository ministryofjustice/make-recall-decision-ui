/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AlternativesToRecallTried } from './AlternativesToRecallTried';
import type { ConvictionDetail } from './ConvictionDetail';
import type { CustodyStatus } from './CustodyStatus';
import type { IndeterminateOrExtendedSentenceDetails } from './IndeterminateOrExtendedSentenceDetails';
import type { IndeterminateSentenceType } from './IndeterminateSentenceType';
import type { LicenceConditionsBreached } from './LicenceConditionsBreached';
import type { LocalPoliceContact } from './LocalPoliceContact';
import type { ManagerRecallDecision } from './ManagerRecallDecision';
import type { NextAppointment } from './NextAppointment';
import type { PersonOnProbationDto } from './PersonOnProbationDto';
import type { PreviousRecalls } from './PreviousRecalls';
import type { PreviousReleases } from './PreviousReleases';
import type { ReasonsForNoRecall } from './ReasonsForNoRecall';
import type { RecallConsidered } from './RecallConsidered';
import type { RecallType } from './RecallType';
import type { RoshData } from './RoshData';
import type { RoshSummary } from './RoshSummary';
import type { SelectedWithDetails } from './SelectedWithDetails';
import type { UnderIntegratedOffenderManagement } from './UnderIntegratedOffenderManagement';
import type { UserAccessResponse } from './UserAccessResponse';
import type { VictimsInContactScheme } from './VictimsInContactScheme';
import type { VulnerabilitiesRecommendation } from './VulnerabilitiesRecommendation';
import type { WhyConsideredRecall } from './WhyConsideredRecall';
import { CvlLicenceConditionsBreached } from "./CvlLicenceConditionsBreached";

export type RecommendationResponse = {
    userAccessResponse?: UserAccessResponse;
    id?: number;
    status?: RecommendationResponse.status;
    custodyStatus?: CustodyStatus;
    localPoliceContact?: LocalPoliceContact;
    crn?: string;
    managerRecallDecision?: ManagerRecallDecision;
    recallType?: RecallType;
    responseToProbation?: string;
    whatLedToRecall?: string;
    isThisAnEmergencyRecall?: boolean;
    isIndeterminateSentence?: boolean;
    isExtendedSentence?: boolean;
    activeCustodialConvictionCount?: number;
    hasVictimsInContactScheme?: VictimsInContactScheme;
    indeterminateSentenceType?: IndeterminateSentenceType;
    dateVloInformed?: string;
    hasArrestIssues?: SelectedWithDetails;
    hasContrabandRisk?: SelectedWithDetails;
    personOnProbation?: PersonOnProbationDto;
    alternativesToRecallTried?: AlternativesToRecallTried;
    licenceConditionsBreached?: LicenceConditionsBreached;
    cvlLicenceConditionsBreached?: CvlLicenceConditionsBreached;
    isUnderIntegratedOffenderManagement?: UnderIntegratedOffenderManagement;
    vulnerabilities?: VulnerabilitiesRecommendation;
    convictionDetail?: ConvictionDetail;
    region?: string;
    localDeliveryUnit?: string;
    userNamePartACompletedBy?: string;
    userEmailPartACompletedBy?: string;
    lastPartADownloadDateTime?: string;
    userNameDntrLetterCompletedBy?: string;
    lastDntrLetterDownloadDateTime?: string;
    indexOffenceDetails?: string;
    offenceAnalysis?: string;
    fixedTermAdditionalLicenceConditions?: SelectedWithDetails;
    indeterminateOrExtendedSentenceDetails?: IndeterminateOrExtendedSentenceDetails;
    isMainAddressWherePersonCanBeFound?: SelectedWithDetails;
    whyConsideredRecall?: WhyConsideredRecall;
    reasonsForNoRecall?: ReasonsForNoRecall;
    nextAppointment?: NextAppointment;
    previousReleases?: PreviousReleases;
    previousRecalls?: PreviousRecalls;
    recallConsideredList?: Array<RecallConsidered>;
    currentRoshForPartA?: RoshData;
    roshSummary?: RoshSummary;
    whoCompletedPartA?: WhoCompletedPartA;
    practitionerForPartA?: PractitionerForPartA;
    revocationOrderRecipients?: string[];
    ppcsQueryEmails?: string[];
};

export namespace RecommendationResponse {

    export enum status {
        DRAFT = 'DRAFT',
        DELETED = 'DELETED',
        RECALL_CONSIDERED = 'RECALL_CONSIDERED',
        DOCUMENT_DOWNLOADED = 'DOCUMENT_DOWNLOADED',
    }


}

export type WhoCompletedPartA = {
    name?: string,
    email?: string,
    telephone?: string,
    region?: string,
    localDeliveryUnit?: string,
    isPersonProbationPractitionerForOffender?: boolean
}

export type PractitionerForPartA = {
    name?: string,
    email?: string,
    telephone?: string,
    region?: string,
    localDeliveryUnit?: string
}
