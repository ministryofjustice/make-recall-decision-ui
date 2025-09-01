import { RecommendationResponse } from '../@types/make-recall-decision-api'

export const isFixedTermRecallMandatoryForRecommendation = (recommendation: RecommendationResponse) =>
  isFixedTermRecallMandatory(
    recommendation?.isSentence48MonthsOrOver,
    recommendation?.isUnder18,
    recommendation?.isMappaCategory4,
    recommendation?.isMappaLevel2Or3,
    recommendation?.isRecalledOnNewChargedOffence,
    recommendation?.isServingFTSentenceForTerroristOffence,
    recommendation?.hasBeenChargedWithTerroristOrStateThreatOffence
  )

export const isFixedTermRecallMandatoryForValueKeys = (values: Record<string, boolean>) =>
  isFixedTermRecallMandatory(
    values.isSentence48MonthsOrOver,
    values.isUnder18,
    values.isMappaCategory4,
    values.isMappaLevel2Or3,
    values.isRecalledOnNewChargedOffence,
    values.isServingFTSentenceForTerroristOffence,
    values.hasBeenChargedWithTerroristOrStateThreatOffence
  )

export const isFixedTermRecallMandatory = (
  isSentence48MonthsOrOver?: boolean,
  isUnder18?: boolean,
  isMappaCategory4?: boolean,
  isMappaLevel2Or3?: boolean,
  isRecalledOnNewChargedOffence?: boolean,
  isServingFTSentenceForTerroristOffence?: boolean,
  hasBeenChargedWithTerroristOrStateThreatOffence?: boolean
) =>
  !(
    (isSentence48MonthsOrOver ?? true) ||
    (isUnder18 ?? true) ||
    (isMappaCategory4 ?? true) ||
    (isMappaLevel2Or3 ?? true) ||
    (isRecalledOnNewChargedOffence ?? true) ||
    (isServingFTSentenceForTerroristOffence ?? true) ||
    (hasBeenChargedWithTerroristOrStateThreatOffence ?? true)
  )
