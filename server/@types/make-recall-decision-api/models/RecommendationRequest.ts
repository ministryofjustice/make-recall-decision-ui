/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

interface FormOption {
    value: string;
    text: string;
}

export type RecommendationRequest = {
    recommendation?: string;
    alternateActions?: string;
    recallType?: {
        value: string;
        options: FormOption[]
    }
};
