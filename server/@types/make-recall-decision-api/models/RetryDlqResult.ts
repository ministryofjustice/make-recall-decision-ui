/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Message } from './Message';

export type RetryDlqResult = {
    messagesFoundCount: number;
    messages: Array<Message>;
};

