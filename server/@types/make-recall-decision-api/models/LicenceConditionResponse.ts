/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LicenceConditionDetail } from './LicenceConditionDetail';

export type LicenceConditionResponse = {
    conditionalReleaseDate?: string;
    actualReleaseDate?: string;
    sentenceStartDate?: string;
    sentenceEndDate?: string;
    licenceStartDate?: string;
    licenceExpiryDate?: string;
    topupSupervisionStartDate?: string;
    topupSupervisionExpiryDate?: string;
    standardLicenceConditions?: Array<LicenceConditionDetail>;
    standardPssConditions?: Array<LicenceConditionDetail>;
    additionalLicenceConditions?: Array<LicenceConditionDetail>;
    additionalPssConditions?: Array<LicenceConditionDetail>;
    bespokeConditions?: Array<LicenceConditionDetail>;
};

