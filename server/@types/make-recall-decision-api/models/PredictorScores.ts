/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PredictorScore } from './PredictorScore';

export type PredictorScores = {
    error?: string;
    current?: PredictorScore;
    historical?: Array<PredictorScore>;
};

