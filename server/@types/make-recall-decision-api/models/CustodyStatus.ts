/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TextValueOption } from './TextValueOption';

export type CustodyStatus = {
    selected?: CustodyStatus.selected;
    details?: string;
    allOptions?: Array<TextValueOption>;
};

export namespace CustodyStatus {

    export enum selected {
        YES_POLICE = 'YES_POLICE',
        YES_PRISON = 'YES_PRISON',
        NO = 'NO',
    }


}

