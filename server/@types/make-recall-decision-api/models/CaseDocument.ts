/* istanbul ignore file */
/* tslint:disable */
 

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

