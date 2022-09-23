/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TextValueOption } from './TextValueOption';

export type IndeterminateSentenceType = {
    selected?: IndeterminateSentenceType.selected;
    allOptions?: Array<TextValueOption>;
};

export namespace IndeterminateSentenceType {

    export enum selected {
        LIFE = 'LIFE',
        IPP = 'IPP',
        DPP = 'DPP',
        NO = 'NO',
    }


}

