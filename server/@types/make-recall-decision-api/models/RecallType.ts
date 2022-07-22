/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RecallTypeOption } from './RecallTypeOption';

export type RecallType = {
    value?: RecallType.value;
    options?: Array<RecallTypeOption>;
};

export namespace RecallType {

    export enum value {
        STANDARD = 'STANDARD',
        NO_RECALL = 'NO_RECALL',
        FIXED_TERM = 'FIXED_TERM',
    }


}
