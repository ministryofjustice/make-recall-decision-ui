/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type MessageAttributeValue = {
    stringValue?: string;
    binaryValue?: {
        short?: number;
        char?: string;
        int?: number;
        long?: number;
        float?: number;
        double?: number;
        direct?: boolean;
        readOnly?: boolean;
    };
    stringListValues?: Array<string>;
    binaryListValues?: Array<{
        short?: number;
        char?: string;
        int?: number;
        long?: number;
        float?: number;
        double?: number;
        direct?: boolean;
        readOnly?: boolean;
    }>;
    dataType?: string;
};

