import { RecommendationResponse } from '../@types/make-recall-decision-api'
import { SentenceGroup } from '../controllers/recommendations/sentenceInformation/formOptions'
import { IsRecalledOnNewChargedOrConvictedOffence } from '../@types/make-recall-decision-api/models/IsRecalledOnNewChargedOrConvictedOffence'

export const isFixedTermRecallMandatoryForRecommendation = (
  recommendation: RecommendationResponse,
  ftr56SentenceConviction: boolean,
) =>
  isFixedTermRecallMandatory(
    recommendation.sentenceGroup,
    {
      wasReferredToParoleBoard244ZB: recommendation?.wasReferredToParoleBoard244ZB,
      wasRepatriatedForMurder: recommendation?.wasRepatriatedForMurder,
      isServingSOPCSentence: recommendation?.isServingSOPCSentence,
      isServingDCRSentence: recommendation?.isServingDCRSentence,
      isChargedWithOffence: recommendation?.isChargedWithOffence,
      isRecalledOnNewChargedOrConvictedOffence: recommendation?.isRecalledOnNewChargedOrConvictedOffence.selected,
      isServingTerroristOrNationalSecurityOffence: recommendation?.isServingTerroristOrNationalSecurityOffence,
      isAtRiskOfInvolvedInForeignPowerThreat: recommendation?.isAtRiskOfInvolvedInForeignPowerThreat,
      isYouthSentenceOver12Months: recommendation?.isYouthSentenceOver12Months,
      isYouthChargedWithSeriousOffence: recommendation?.isYouthChargedWithSeriousOffence,
      isMappaCategory4: recommendation?.isMappaCategory4,
      isMappaLevel2Or3: recommendation?.isMappaLevel2Or3,
    },
    ftr56SentenceConviction,
  )

type MandatoryFTRCriteria = {
  wasReferredToParoleBoard244ZB?: boolean
  wasRepatriatedForMurder?: boolean
  isServingSOPCSentence?: boolean
  isServingDCRSentence?: boolean
  isChargedWithOffence?: boolean
  isRecalledOnNewChargedOrConvictedOffence?: IsRecalledOnNewChargedOrConvictedOffence.selected
  isServingTerroristOrNationalSecurityOffence?: boolean
  isAtRiskOfInvolvedInForeignPowerThreat?: boolean
  isYouthSentenceOver12Months?: boolean
  isYouthChargedWithSeriousOffence?: boolean
  isMappaCategory4?: boolean
  isMappaLevel2Or3?: boolean
}

const isFixedTermRecallMandatory = (
  sentenceGroup: SentenceGroup,
  criteria: MandatoryFTRCriteria,
  ftr56SentenceConviction: boolean,
) => {
  if (sentenceGroup === SentenceGroup.ADULT_SDS) {
    if (!ftr56SentenceConviction) {
      return !(
        (criteria.wasReferredToParoleBoard244ZB ?? true) ||
        (criteria.wasRepatriatedForMurder ?? true) ||
        (criteria.isServingSOPCSentence ?? true) ||
        (criteria.isServingDCRSentence ?? true) ||
        (criteria.isChargedWithOffence ?? true) ||
        (criteria.isServingTerroristOrNationalSecurityOffence ?? true) ||
        (criteria.isAtRiskOfInvolvedInForeignPowerThreat ?? true) ||
        (criteria.isMappaCategory4 ?? true) ||
        (criteria.isMappaLevel2Or3 ?? true)
      )
    }

    return (
      [
        IsRecalledOnNewChargedOrConvictedOffence.selected.CHARGED_AND_CONVICTED,
        IsRecalledOnNewChargedOrConvictedOffence.selected.NO,
      ].includes(criteria.isRecalledOnNewChargedOrConvictedOffence) &&
      !(
        (criteria.wasReferredToParoleBoard244ZB ?? true) ||
        (criteria.wasRepatriatedForMurder ?? true) ||
        (criteria.isServingSOPCSentence ?? true) ||
        (criteria.isServingDCRSentence ?? true) ||
        (criteria.isServingTerroristOrNationalSecurityOffence ?? true) ||
        (criteria.isAtRiskOfInvolvedInForeignPowerThreat ?? true) ||
        (criteria.isMappaCategory4 ?? true) ||
        (criteria.isMappaLevel2Or3 ?? true)
      )
    )
  }

  if (sentenceGroup === SentenceGroup.YOUTH_SDS) {
    return !(
      (criteria.isYouthSentenceOver12Months ?? true) ||
      (criteria.isYouthChargedWithSeriousOffence ?? true) ||
      (criteria.isMappaLevel2Or3 ?? true)
    )
  }

  return false
}

export const isRecommendationDiscretionaryRecall = ({
  isYouthSentenceOver12Months,
  isYouthChargedWithSeriousOffence,
  isMappaLevel2Or3,
}: RecommendationResponse) => isYouthSentenceOver12Months || isYouthChargedWithSeriousOffence || isMappaLevel2Or3

export const isStandardRecallMandatoryForRecommendation = (
  recommendation: RecommendationResponse,
  ftr56SentenceConviction: boolean,
) =>
  [SentenceGroup.INDETERMINATE, SentenceGroup.EXTENDED].includes(recommendation.sentenceGroup) ||
  (recommendation.sentenceGroup === SentenceGroup.ADULT_SDS &&
    !isFixedTermRecallMandatoryForRecommendation(recommendation, ftr56SentenceConviction))
