/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserAccessResponse } from './UserAccessResponse'

export type LetterContent = {
    letterAddress: string;
    letterDate: string;
    salutation: string;
    letterTitle: string;
    section1: string;
    section2: string;
    section3: string;
    signedByParagraph: string;
}

export type DocumentResponse = {
    userAccessResponse?: UserAccessResponse;
    fileName?: string;
    fileContents?: string;
    letterContent?: LetterContent;
};

