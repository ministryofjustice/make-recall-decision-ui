/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AssessmentInfo } from './AssessmentInfo';
import type { RiskManagementPlan } from './RiskManagementPlan';

export type Risk = {
    flags?: Array<string>;
    riskManagementPlan?: RiskManagementPlan;
    assessments?: AssessmentInfo;
};

