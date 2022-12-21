/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Institution } from './Institution';
import type { Reason } from './Reason';

export type LastRelease = {
    date?: string;
    notes?: string;
    reason?: Reason;
    institution?: Institution;
};

