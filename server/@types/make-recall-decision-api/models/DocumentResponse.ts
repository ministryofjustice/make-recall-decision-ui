/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserAccessResponse } from './UserAccessResponse';

export type DocumentResponse = {
    userAccessResponse?: UserAccessResponse;
    fileName?: string;
    fileContents?: string;
};

