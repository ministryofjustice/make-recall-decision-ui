/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RecallTypeSelectedValue } from './RecallTypeSelectedValue';
import type { TextValueOption } from './TextValueOption';

export type NextAppointment = {
    dateTimeOfAppointment?: string;
    probationPhoneNumber?: string;
    howWillAppointmentHappen?: HowWillAppointmentHappen;
}

export type HowWillAppointmentHappen = {
    selected?: RecallTypeSelectedValue;
    allOptions?: Array<TextValueOption>;
};

