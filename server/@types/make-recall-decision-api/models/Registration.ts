/* istanbul ignore file */
/* tslint:disable */
 

import type { CodeDescriptionItem } from './CodeDescriptionItem';

export type Registration = {
    registrationId?: string;
    active?: boolean;
    register?: CodeDescriptionItem;
    type?: CodeDescriptionItem;
    startDate?: string;
    notes?: string;
};

