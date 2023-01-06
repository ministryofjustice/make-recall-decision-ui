/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ManagerRecallDecisionTypeSelectedValue } from './ManagerRecallDecisionTypeSelectedValue';
import type { TextValueOption } from './TextValueOption';

export type ManagerRecallDecision = {
    selected?: ManagerRecallDecisionTypeSelectedValue;
    allOptions?: Array<TextValueOption>;
    isSentToDelius?: boolean;
    createdBy?: string;
    createdDate?: string;
};

