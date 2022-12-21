/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EstablishmentType } from './EstablishmentType';

export type Institution = {
    code?: string;
    description?: string;
    establishmentType?: EstablishmentType;
    institutionId?: number;
    institutionName?: string;
    isEstablishment?: boolean;
    isPrivate?: boolean;
    nomsPrisonInstitutionCode?: string;
};

