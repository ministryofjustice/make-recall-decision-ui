/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LetterContent } from './LetterContent';
import type { UserAccessResponse } from './UserAccessResponse';

export type DocumentResponse = {
    userAccessResponse?: UserAccessResponse;
    fileName?: string;
    fileContents?: string;
    letterContent?: LetterContent;
};

