/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type RecommendationsListItem = {
    statusForRecallType?: RecommendationsListItem.statusForRecallType;
    lastModifiedBy?: string;
    createdDate?: string;
    lastModifiedDate?: string;
};

export namespace RecommendationsListItem {

    export enum statusForRecallType {
        CONSIDERING_RECALL = 'CONSIDERING_RECALL',
        RECOMMENDATION_STARTED = 'RECOMMENDATION_STARTED',
        MAKING_DECISION_TO_RECALL = 'MAKING_DECISION_TO_RECALL',
        MAKING_DECISION_NOT_TO_RECALL = 'MAKING_DECISION_NOT_TO_RECALL',
        DECIDED_TO_RECALL = 'DECIDED_TO_RECALL',
        DECIDED_NOT_TO_RECALL = 'DECIDED_NOT_TO_RECALL',
        UNKNOWN = 'UNKNOWN',
    }


}

