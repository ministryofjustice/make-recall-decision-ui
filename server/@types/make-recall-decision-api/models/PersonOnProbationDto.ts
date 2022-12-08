/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Address } from './Address';
import type { Mappa } from './Mappa';

export type PersonOnProbationDto = {
    fullName?: string;
    name?: string;
    firstName?: string;
    surname?: string;
    middleNames?: string;
    gender?: string;
    ethnicity?: string;
    dateOfBirth?: string;
    croNumber?: string;
    mostRecentPrisonerNumber?: string;
    nomsNumber?: string;
    pncNumber?: string;
    mappa?: Mappa;
    addresses?: Array<Address>;
    primaryLanguage?: string;
    hasBeenReviewed?: boolean;
};

