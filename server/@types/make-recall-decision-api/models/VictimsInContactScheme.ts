/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TextValueOption } from './TextValueOption';

export type VictimsInContactScheme = {
    selected?: VictimsInContactScheme.selected;
    allOptions?: Array<TextValueOption>;
};

export namespace VictimsInContactScheme {

    export enum selected {
        YES = 'YES',
        NO = 'NO',
        NOT_APPLICABLE = 'NOT_APPLICABLE',
    }


}

