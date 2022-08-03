/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CaseDocument } from './CaseDocument';
import type { LicenceCondition } from './LicenceCondition';
import type { Offence } from './Offence';

export type ConvictionResponse = {
    convictionId?: number;
    active?: boolean;
    offences?: Array<Offence>;
    sentenceDescription?: string;
    sentenceOriginalLength?: number;
    sentenceOriginalLengthUnits?: string;
    sentenceStartDate?: string;
    sentenceExpiryDate?: string;
    licenceExpiryDate?: string;
    postSentenceSupervisionEndDate?: string;
    statusCode?: string;
    statusDescription?: string;
    licenceConditions?: Array<LicenceCondition>;
    licenceDocuments?: Array<CaseDocument>;
    isCustodial?: boolean;
};
