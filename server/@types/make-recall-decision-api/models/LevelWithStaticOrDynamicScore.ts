/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import { StaticOrDynamic } from './Scores'

export type LevelWithStaticOrDynamicScore = {
  level?: string;
  type?: string;
  score?: string;
  staticOrDynamic?: StaticOrDynamic;
};