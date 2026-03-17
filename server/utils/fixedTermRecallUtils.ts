import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { SentenceGroup } from '../controllers/recommendations/sentenceInformation/formOptions'

export const isFixedTermRecallMandatoryForRecommendation = (
  recommendation: RecommendationResponse,
  ftr56Enabled: boolean,
) =>
  ftr56Enabled
    ? isFixedTermRecallMandatoryFTR56(recommendation.sentenceGroup, {
        wasReferredToParoleBoard244ZB: recommendation.wasReferredToParoleBoard244ZB,
        wasRepatriatedForMurder: recommendation.wasRepatriatedForMurder,
        isServingSOPCSentence: recommendation.isServingSOPCSentence,
        isServingDCRSentence: recommendation.isServingDCRSentence,
        isChargedWithOffence: recommendation.isChargedWithOffence,
        isServingTerroristOrNationalSecurityOffence: recommendation.isServingTerroristOrNationalSecurityOffence,
        isAtRiskOfInvolvedInForeignPowerThreat: recommendation.isAtRiskOfInvolvedInForeignPowerThreat,
        isYouthSentenceOver12Months: recommendation.isYouthSentenceOver12Months,
        isYouthChargedWithSeriousOffence: recommendation.isYouthChargedWithSeriousOffence,
      })
    : isFixedTermRecallMandatory(
        recommendation?.isSentence48MonthsOrOver,
        recommendation?.isUnder18,
        recommendation?.isMappaCategory4,
        recommendation?.isMappaLevel2Or3,
        recommendation?.isRecalledOnNewChargedOffence,
        recommendation?.isServingFTSentenceForTerroristOffence,
        recommendation?.hasBeenChargedWithTerroristOrStateThreatOffence,
      )

export const isFixedTermRecallMandatoryForValueKeys = (values: Record<string, boolean>) =>
  isFixedTermRecallMandatory(
    values.isSentence48MonthsOrOver,
    values.isUnder18,
    values.isMappaCategory4,
    values.isMappaLevel2Or3,
    values.isRecalledOnNewChargedOffence,
    values.isServingFTSentenceForTerroristOffence,
    values.hasBeenChargedWithTerroristOrStateThreatOffence,
  )

export const isFixedTermRecallMandatoryForValueKeysFTR56 = (
  sentenceGroup: SentenceGroup,
  values: Record<string, boolean>,
) =>
  isFixedTermRecallMandatoryFTR56(sentenceGroup, {
    wasReferredToParoleBoard244ZB: values?.wasReferredToParoleBoard244ZB,
    wasRepatriatedForMurder: values?.wasRepatriatedForMurder,
    isServingSOPCSentence: values?.isServingSOPCSentence,
    isServingDCRSentence: values?.isServingDCRSentence,
    isChargedWithOffence: values?.isChargedWithOffence,
    isServingTerroristOrNationalSecurityOffence: values?.isServingTerroristOrNationalSecurityOffence,
    isAtRiskOfInvolvedInForeignPowerThreat: values?.isAtRiskOfInvolvedInForeignPowerThreat,
    isYouthSentenceOver12Months: values?.isYouthSentenceOver12Months,
    isYouthChargedWithSeriousOffence: values?.isYouthChargedWithSeriousOffence,
  })

export const isFixedTermRecallMandatory = (
  isSentence48MonthsOrOver?: boolean,
  isUnder18?: boolean,
  isMappaCategory4?: boolean,
  isMappaLevel2Or3?: boolean,
  isRecalledOnNewChargedOffence?: boolean,
  isServingFTSentenceForTerroristOffence?: boolean,
  hasBeenChargedWithTerroristOrStateThreatOffence?: boolean,
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

type MandatoryFTRCriteria = {
  wasReferredToParoleBoard244ZB?: boolean
  wasRepatriatedForMurder?: boolean
  isServingSOPCSentence?: boolean
  isServingDCRSentence?: boolean
  isChargedWithOffence?: boolean
  isServingTerroristOrNationalSecurityOffence?: boolean
  isAtRiskOfInvolvedInForeignPowerThreat?: boolean
  isYouthSentenceOver12Months?: boolean
  isYouthChargedWithSeriousOffence?: boolean
}

export const isFixedTermRecallMandatoryFTR56 = (sentenceGroup: SentenceGroup, criteria: MandatoryFTRCriteria) => {
  if (sentenceGroup === SentenceGroup.ADULT_SDS) {
    return !(
      (criteria.wasReferredToParoleBoard244ZB ?? true) ||
      (criteria.wasRepatriatedForMurder ?? true) ||
      (criteria.isServingSOPCSentence ?? true) ||
      (criteria.isServingDCRSentence ?? true) ||
      (criteria.isChargedWithOffence ?? true) ||
      (criteria.isServingTerroristOrNationalSecurityOffence ?? true) ||
      (criteria.isAtRiskOfInvolvedInForeignPowerThreat ?? true)
    )
  }

  if (sentenceGroup === SentenceGroup.YOUTH_SDS) {
    return !((criteria.isYouthSentenceOver12Months ?? true) || (criteria.isYouthChargedWithSeriousOffence ?? true))
  }

  return false
}
