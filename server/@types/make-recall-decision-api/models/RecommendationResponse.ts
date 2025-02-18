/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AlternativesToRecallTried } from './AlternativesToRecallTried'
import type { ConvictionDetail } from './ConvictionDetail'
import type { CustodyStatus } from './CustodyStatus'
import type { IndeterminateOrExtendedSentenceDetails } from './IndeterminateOrExtendedSentenceDetails'
import type { IndeterminateSentenceType } from './IndeterminateSentenceType'
import type { LicenceConditionsBreached } from './LicenceConditionsBreached'
import type { LocalPoliceContact } from './LocalPoliceContact'
import type { ManagerRecallDecision } from './ManagerRecallDecision'
import type { NextAppointment } from './NextAppointment'
import type { PersonOnProbationDto } from './PersonOnProbationDto'
import type { PreviousRecalls } from './PreviousRecalls'
import type { PreviousReleases } from './PreviousReleases'
import type { ReasonsForNoRecall } from './ReasonsForNoRecall'
import type { RecallConsidered } from './RecallConsidered'
import type { RecallType } from './RecallType'
import type { RoshData } from './RoshData'
import type { RoshSummary } from './RoshSummary'
import type { SelectedWithDetails } from './SelectedWithDetails'
import type { UnderIntegratedOffenderManagement } from './UnderIntegratedOffenderManagement'
import type { UserAccessResponse } from './UserAccessResponse'
import type { VictimsInContactScheme } from './VictimsInContactScheme'
import type { VulnerabilitiesRecommendation } from './VulnerabilitiesRecommendation'
import type { WhyConsideredRecall } from './WhyConsideredRecall'
import { CvlLicenceConditionsBreached } from './CvlLicenceConditionsBreached'
import BookingMemento from '../../../booking/BookingMemento'

export type RecommendationResponse = {
  userAccessResponse?: UserAccessResponse;
  ppudRecordPresent?: boolean;
  id?: number;
  createdByUserFullName?: string;
  createdBy?: string;
  createdDate?: string;
  status?: RecommendationResponse.status;
  custodyStatus?: CustodyStatus;
  localPoliceContact?: LocalPoliceContact;
  crn?: string;
  managerRecallDecision?: ManagerRecallDecision;
  recallType?: RecallType;
  decisionDateTime?: string;
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
  releaseUnderECSL?: boolean;
  dateOfRelease?: string;
  conditionalReleaseDate?: string;
  nomisIndexOffence?: NomisIndexOffence;
  bookRecallToPpud?: BookRecallToPpud;
  prisonOffender?: PrisonOffender;
  ppudOffender?: PpudOffender;
  additionalLicenceConditionsText?: string;
  bookingMemento?: BookingMemento;
  odmName?: string;
  spoRecallType?: string;
  isUnder18?: boolean,
  isMappaLevelAbove1?: boolean,
  isSentence12MonthsOrOver?: boolean,
  hasBeenConvictedOfSeriousOffence?: boolean,
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
  name?: string;
  email?: string;
  telephone?: string;
  region?: string;
  localDeliveryUnit?: string;
  isPersonProbationPractitionerForOffender?: boolean
}

export type PractitionerForPartA = {
  name?: string;
  email?: string;
  telephone?: string;
  region?: string;
  localDeliveryUnit?: string
}

export type NomisIndexOffence = {
  selected?: number;
  allOptions?: OfferedOffence[]
}

export type OfferedOffence = {
  offenderChargeId?: number;
  offenceCode?: string;
  offenceStatute: string;
  offenceDescription: string;
  offenceDate: string;
  sentenceDate: string;
  courtDescription: string;
  sentenceStartDate: string;
  sentenceEndDate: string;
  bookingId: number;
  terms: Term[];
  releaseDate: string;
  releasingPrison: string;
  licenceExpiryDate: string;
}

export type Term = {
  years: number;
  months: number;
  weeks: number;
  days: number
  code: string;
}

export type BookRecallToPpud = {
  firstNames: string,
  lastName: string,
  dateOfBirth: string,
  prisonNumber?: string,
  cro?: string,
  decisionDateTime?: string,
  receivedDateTime?: string,
  custodyType?: string,
  indexOffence?: string,
  indexOffenceComment?: string,
  ppudSentenceId?: string,
  mappaLevel?: string,
  policeForce?: string,
  probationArea?: string,
  sentenceDate?: string,
  gender?: string,
  ethnicity: string,
  legislationReleasedUnder?: string,
  legislationSentencedUnder?: string,
  releasingPrison?: string,
  minute?: string,
  currentEstablishment?: string,
}

export type PrisonOffender = {
  image: string,
  locationDescription: string,
  bookingNo: string,
  facialImageId: number,
  firstName: string,
  middleName: string,
  lastName: string,
  dateOfBirth: string,
  status: string,
  gender: string,
  ethnicity: string,
  cro: string,
  pnc: string,
  establishment: string,
}

export type PpudOffender = {
  id: string,
  croOtherNumber: string,
  dateOfBirth: string,
  ethnicity: string,
  familyName: string,
  firstNames: string,
  gender: string,
  immigrationStatus: string,
  establishment: string,
  nomsId: string,
  prisonerCategory: string,
  prisonNumber: string,
  sentences: PpudSentence[],
  status: string,
  youngOffender: string,
}

export type PpudSentence = {
  id: string,
  sentenceExpiryDate: string,
  dateOfSentence: string,
  custodyType: string,
  mappaLevel: string,
  licenceExpiryDate: string,
  offence: PpudOffence,
  releaseDate: string,
  sentenceLength: PpudSentenceLength,
  sentencingCourt: string,
}

export type PpudOffence = {
  indexOffence: string,
  dateOfIndexOffence: string,
}

export type PpudSentenceLength = {
  partYears: number,
  partMonths: number,
  partDays: number,
}

export type PpudUser = {
  fullName: string,
  teamName: string,
}

