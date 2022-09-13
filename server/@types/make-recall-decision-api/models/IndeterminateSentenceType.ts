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
        LIFE = 'Life sentence',
        IPP = 'Imprisonment for Public Protection (IPP) sentence',
        DPP = 'Detention for Public Protection (DPP) sentence',
        NO = 'NO',
    }


}

