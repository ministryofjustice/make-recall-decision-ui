/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LevelWithScore } from './LevelWithScore';
import type { LevelWithTwoYearScores } from './LevelWithTwoYearScores';
import { LevelWithStaticOrDynamicScore } from './LevelWithStaticOrDynamicScore'

export type Scores = {
  // V1 assessment scores
    RSR?: LevelWithStaticOrDynamicScore;
    OSPC?: LevelWithScore;
    OSPI?: LevelWithScore;
    OSPDC?: LevelWithScore;
    OSPIIC?: LevelWithScore;
    OGRS?: LevelWithTwoYearScores;
    OGP?: LevelWithTwoYearScores;
    OVP?: LevelWithTwoYearScores;

  // V2 assessment scores
   allReoffendingPredictor?: StaticOrDynamicPredictor,
   violentReoffendingPredictor?: StaticOrDynamicPredictor,
   seriousViolentReoffendingPredictor?: StaticOrDynamicPredictor,
   directContactSexualReoffendingPredictor?: FourBandPredictor,
   indirectImageContactSexualReoffendingPredictor?: ThreeBandPredictor,
   combinedSeriousReoffendingPredictor?: CombinedPredictor,
};

export interface ThreeBandPredictor {
  score?: number;
  band?: ThreeBandRiskScoreBand;
}

export interface FourBandPredictor {
  score?: number;
  band?: FourBandRiskScoreBand;
}

export interface StaticOrDynamicPredictor {
  score?: number;
  band?: FourBandRiskScoreBand;
  staticOrDynamic?: StaticOrDynamic;
}

export interface CombinedPredictor {
  score?: number;
  band?: FourBandRiskScoreBand;
  staticOrDynamic?: StaticOrDynamic;
  algorithmVersion?: string;
}

export enum StaticOrDynamic {
  STATIC = "STATIC",
  DYNAMIC = "DYNAMIC",
}

export enum FourBandRiskScoreBand {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  VERY_HIGH = "VERY_HIGH",
}

export enum ThreeBandRiskScoreBand {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

