/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CaseDocument } from './CaseDocument';

export type ContactSummaryResponse = {
    contactStartDate?: string;
    descriptionType?: string;
    code?: string;
    outcome?: string;
    notes?: string;
    enforcementAction?: string;
    systemGenerated?: boolean;
    sensitive?: boolean;
    contactDocuments?: Array<CaseDocument>;
    description?: string;
};

