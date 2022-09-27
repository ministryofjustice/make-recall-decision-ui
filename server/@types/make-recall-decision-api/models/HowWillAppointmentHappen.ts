/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TextValueOption } from './TextValueOption';

export type HowWillAppointmentHappen = {
    selected?: HowWillAppointmentHappen.selected;
    allOptions?: Array<TextValueOption>;
};

export namespace HowWillAppointmentHappen {

    export enum selected {
        TELEPHONE = 'TELEPHONE',
        VIDEO_CALL = 'VIDEO_CALL',
        OFFICE_VISIT = 'OFFICE_VISIT',
        HOME_VISIT = 'HOME_VISIT',
    }


}

