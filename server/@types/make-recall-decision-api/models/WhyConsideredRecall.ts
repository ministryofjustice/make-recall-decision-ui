/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TextValueOption } from './TextValueOption';

export type WhyConsideredRecall = {
    selected?: WhyConsideredRecall.selected;
    allOptions?: Array<TextValueOption>;
};

export namespace WhyConsideredRecall {
    export enum selected {
        RISK_INCREASED = "Your risk is assessed as increased",
        CONTACT_STOPPED = "Contact with your probation practitioner has broken down",
        RISK_INCREASED_AND_CONTACT_STOPPED = "Your risk is assessed as increased and contact with your probation practitioner has broken down"
    }
}

