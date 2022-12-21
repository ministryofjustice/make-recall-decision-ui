/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MessageAttributeValue } from './MessageAttributeValue';

export type Message = {
    messageId?: string;
    receiptHandle?: string;
    body?: string;
    attributes?: Record<string, string>;
    messageAttributes?: Record<string, MessageAttributeValue>;
    md5OfBody?: string;
    md5OfMessageAttributes?: string;
};

