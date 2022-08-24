/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LastRecall } from './LastRecall';
import type { LastRelease } from './LastRelease';

export type ReleaseSummaryResponse = {
    lastRelease?: LastRelease;
    lastRecall?: LastRecall;
};

