/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CaseDocumentType } from './CaseDocumentType';

export type CaseDocument = {
    id?: string;
    documentName?: string;
    author?: string;
    type?: CaseDocumentType;
    extendedDescription?: string;
    lastModifiedAt?: string;
    createdAt?: string;
    parentPrimaryKeyId?: number;
};

