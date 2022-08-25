/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { HistoricalScore } from './HistoricalScore';
import type { Scores } from './Scores';

export type PredictorScores = {
    current?: Scores;
    historical?: Array<HistoricalScore>;
};

