/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Offence } from './Offence';

export type OverviewConvictionResponse = {
    active?: boolean;
    offences?: Array<Offence>;
    sentenceDescription?: string;
    sentenceOriginalLength?: number;
    sentenceOriginalLengthUnits?: string;
    sentenceExpiryDate?: string;
    licenceExpiryDate?: string;
    isCustodial?: boolean;
};

