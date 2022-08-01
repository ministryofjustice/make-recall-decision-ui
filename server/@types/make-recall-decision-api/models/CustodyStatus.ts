/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CustodyStatusOption } from './CustodyStatusOption';

export type CustodyStatus = {
    value?: CustodyStatus.value;
    options?: Array<CustodyStatusOption>;
};

export namespace CustodyStatus {

    export enum value {
        YES_PRISON = 'YES_PRISON',
        YES_POLICE = 'YES_POLICE',
        NO = 'NO',
    }


}
