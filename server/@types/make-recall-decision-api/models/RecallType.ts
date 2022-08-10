/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TextValueOption } from './TextValueOption';

export type RecallType = {
    selected?: {
        value: string
        details?: string
    };
    allOptions?: Array<TextValueOption>;
};
