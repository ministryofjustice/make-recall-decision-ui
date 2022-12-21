/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DlqMessage } from './DlqMessage';

export type GetDlqResult = {
    messagesFoundCount: number;
    messagesReturnedCount: number;
    messages: Array<DlqMessage>;
};

