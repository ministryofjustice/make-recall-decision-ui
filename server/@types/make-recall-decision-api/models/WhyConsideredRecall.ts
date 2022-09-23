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
        RISK_INCREASED = 'RISK_INCREASED',
        CONTACT_STOPPED = 'CONTACT_STOPPED',
        RISK_INCREASED_AND_CONTACT_STOPPED = 'RISK_INCREASED_AND_CONTACT_STOPPED',
    }


}

