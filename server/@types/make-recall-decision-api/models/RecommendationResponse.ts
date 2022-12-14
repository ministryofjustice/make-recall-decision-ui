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
import type { NextAppointment } from './NextAppointment';
import type { PersonOnProbationDto } from './PersonOnProbationDto';
import type { ReasonsForNoRecall } from './ReasonsForNoRecall';
import type { RecallType } from './RecallType';
import type { SelectedWithDetails } from './SelectedWithDetails';
import type { UnderIntegratedOffenderManagement } from './UnderIntegratedOffenderManagement';
import type { UserAccessResponse } from './UserAccessResponse';
import type { VictimsInContactScheme } from './VictimsInContactScheme';
import type { VulnerabilitiesRecommendation } from './VulnerabilitiesRecommendation';
import type { WhyConsideredRecall } from './WhyConsideredRecall';
import { PreviousReleases } from './PreviousReleases'
import { RecallConsidered } from './RecallConsidered'

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
    isUnderIntegratedOffenderManagement?: UnderIntegratedOffenderManagement;
    vulnerabilities?: VulnerabilitiesRecommendation;
    convictionDetail?: ConvictionDetail;
    region?: string;
    localDeliveryUnit?: string;
    userNamePartACompletedBy?: string;
    userEmailPartACompletedBy?: string;
    lastPartADownloadDateTime?: string;
    indexOffenceDetails?: string;
    offenceAnalysis?: string;
    fixedTermAdditionalLicenceConditions?: SelectedWithDetails;
    indeterminateOrExtendedSentenceDetails?: IndeterminateOrExtendedSentenceDetails;
    isMainAddressWherePersonCanBeFound?: SelectedWithDetails;
    whyConsideredRecall?: WhyConsideredRecall;
    reasonsForNoRecall?: ReasonsForNoRecall;
    nextAppointment?: NextAppointment;
    previousReleases?: PreviousReleases;
    recallConsideredList?: RecallConsidered[]
};

export namespace RecommendationResponse {

    export enum status {
        RECALL_CONSIDERED = 'RECALL_CONSIDERED',
        DRAFT = 'DRAFT',
        DOCUMENT_CREATED = 'DOCUMENT_CREATED',
        DELETED = 'DELETED',
    }


}

