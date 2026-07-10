import { RecommendationResponse } from '../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { RecallTypeSelectedValue } from '../../../@types/make-recall-decision-api/models/RecallTypeSelectedValue'
import { hasData, hasValue, isEmptyStringOrWhitespace } from '../../../utils/utils'
import type { FeatureFlags } from '../../../@types/featureFlags'
import { VULNERABILITY } from '../vulnerabilities/formOptions'
import { vulnerabilityRequiresDetails } from '../vulnerabilitiesDetails/formValidator'
import { SentenceGroup } from '../sentenceInformation/formOptions'

const isVictimContactSchemeComplete = (recommendation: RecommendationResponse) => {
  if (recommendation.hasVictimsInContactScheme === null) {
    return false
  }
  if (recommendation.hasVictimsInContactScheme?.selected === 'YES') {
    return hasValue(recommendation.dateVloInformed)
  }
  return hasValue(recommendation.hasVictimsInContactScheme?.selected)
}

const isPreviousReleasesComplete = (recommendation: RecommendationResponse) => {
  if (recommendation.previousReleases === null || typeof recommendation.previousReleases === 'undefined') {
    return false
  }
  if (recommendation.previousReleases?.hasBeenReleasedPreviously === true) {
    return recommendation.previousReleases?.previousReleaseDates?.length > 0
  }
  return recommendation.previousReleases?.hasBeenReleasedPreviously === false
}

const isVulnerabilitiesComplete = (recommendation: RecommendationResponse, _featureFlags?: FeatureFlags) => {
  if (recommendation.vulnerabilities === null || typeof recommendation.vulnerabilities === 'undefined') {
    return false
  }
  return recommendation.vulnerabilities?.selected?.length > 0 && hasAllRequiredVulnerabilityDetails(recommendation)
}

export const hasAllRequiredVulnerabilityDetails = (recommendation: RecommendationResponse): boolean => {
  const selectedVulnerabilities = recommendation.vulnerabilities?.selected
  return (
    !selectedVulnerabilities ||
    !selectedVulnerabilities.some(
      valueWithDetails =>
        vulnerabilityRequiresDetails(valueWithDetails.value as VULNERABILITY) &&
        isEmptyStringOrWhitespace(valueWithDetails?.details),
    )
  )
}

export const taskCompleteness = (recommendation: RecommendationResponse, _featureFlags?: FeatureFlags) => {
  let statuses: Record<string, boolean> = {
    alternativesToRecallTried: hasData(recommendation.alternativesToRecallTried?.selected),
    recallType: hasValue(recommendation.recallType?.selected),
    decisionDateTime: hasValue(recommendation.decisionDateTime),
    sentenceGroup: hasValue(recommendation.sentenceGroup),
    triggerLeadingToRecall: hasValue(recommendation.triggerLeadingToRecall),
    previousReleases: isPreviousReleasesComplete(recommendation),
    licenceConditionsBreached:
      hasData(recommendation.licenceConditionsBreached?.standardLicenceConditions?.selected) ||
      hasData(recommendation.licenceConditionsBreached?.additionalLicenceConditions?.selectedOptions) ||
      hasData(recommendation.cvlLicenceConditionsBreached?.standardLicenceConditions?.selected) ||
      hasData(recommendation.cvlLicenceConditionsBreached?.additionalLicenceConditions?.selected) ||
      hasData(recommendation.cvlLicenceConditionsBreached?.bespokeLicenceConditions?.selected) ||
      hasData(recommendation.additionalLicenceConditionsText),
    isChargedWithOffence: hasValue(recommendation.isChargedWithOffence),
    isServingTerroristOrNationalSecurityOffence: hasValue(recommendation.isServingTerroristOrNationalSecurityOffence),
    isAtRiskOfInvolvedInForeignPowerThreat: hasValue(recommendation.isAtRiskOfInvolvedInForeignPowerThreat),
    wasReferredToParoleBoard244ZB: hasValue(recommendation.wasReferredToParoleBoard244ZB),
    wasRepatriatedForMurder: hasValue(recommendation.wasRepatriatedForMurder),
    isServingSOPCSentence: hasValue(recommendation.isServingSOPCSentence),
    isServingDCRSentence: hasValue(recommendation.isServingDCRSentence),
    isYouthSentenceOver12Months: hasValue(recommendation.isYouthSentenceOver12Months),
    isYouthChargedWithSeriousOffence: hasValue(recommendation.isYouthChargedWithSeriousOffence),
  }

  if (_featureFlags?.ftr56SentenceConviction) {
    statuses.isRecalledOnNewChargedOrConvictedOffence = hasValue(
      recommendation.isRecalledOnNewChargedOrConvictedOffence?.selected,
    )
  }

  const { triggerLeadingToRecall } = statuses

  let isAdultSDSSuitabilityCriteriaSet

  isAdultSDSSuitabilityCriteriaSet =
    statuses.isChargedWithOffence &&
    statuses.isServingTerroristOrNationalSecurityOffence &&
    statuses.isAtRiskOfInvolvedInForeignPowerThreat &&
    statuses.wasReferredToParoleBoard244ZB &&
    statuses.wasRepatriatedForMurder &&
    statuses.isServingSOPCSentence &&
    statuses.isServingDCRSentence

  if (_featureFlags?.ftr56SentenceConviction) {
    isAdultSDSSuitabilityCriteriaSet =
      statuses.isChargedWithOffence &&
      statuses.isServingTerroristOrNationalSecurityOffence &&
      statuses.isAtRiskOfInvolvedInForeignPowerThreat &&
      statuses.wasReferredToParoleBoard244ZB &&
      statuses.wasRepatriatedForMurder &&
      statuses.isServingSOPCSentence &&
      statuses.isServingDCRSentence &&
      statuses.isRecalledOnNewChargedOrConvictedOffence
  }

  const isYouthSDSSuitabilityCriteriaSet =
    statuses.isYouthSentenceOver12Months && statuses.isYouthChargedWithSeriousOffence

  let suitabilityForRecallValidation = true

  if (recommendation.sentenceGroup === SentenceGroup.ADULT_SDS) {
    suitabilityForRecallValidation = isAdultSDSSuitabilityCriteriaSet
  } else if (recommendation.sentenceGroup === SentenceGroup.YOUTH_SDS) {
    suitabilityForRecallValidation = isYouthSDSSuitabilityCriteriaSet
  }

  const indeterminateSentenceValidation =
    recommendation.sentenceGroup !== SentenceGroup.INDETERMINATE || hasValue(recommendation.indeterminateSentenceType)

  if (recommendation.recallType?.selected?.value === RecallTypeSelectedValue.value.NO_RECALL) {
    const whyConsideredRecall = hasValue(recommendation.whyConsideredRecall)
    const reasonsForNoRecall = hasValue(recommendation.reasonsForNoRecall)
    const nextAppointment = hasValue(recommendation.nextAppointment)

    const isAdultSDS = recommendation.sentenceGroup === SentenceGroup.ADULT_SDS

    let mappaReviewed = true

    if (isAdultSDS) {
      mappaReviewed = recommendation.personOnProbation?.ftr56MappaReviewed
    }

    return {
      statuses: {
        ...statuses,
        whyConsideredRecall,
        reasonsForNoRecall,
        nextAppointment,
      },
      isReadyForCounterSignature: false,
      areAllComplete:
        triggerLeadingToRecall &&
        suitabilityForRecallValidation &&
        mappaReviewed &&
        statuses.alternativesToRecallTried &&
        statuses.recallType &&
        statuses.sentenceGroup &&
        statuses.licenceConditionsBreached &&
        indeterminateSentenceValidation &&
        whyConsideredRecall &&
        reasonsForNoRecall &&
        nextAppointment,
    }
  }

  statuses = {
    ...statuses,
    custodyStatus: hasValue(recommendation.custodyStatus),
    whatLedToRecall: hasValue(recommendation.whatLedToRecall),
    isThisAnEmergencyRecall: hasValue(recommendation.isThisAnEmergencyRecall),
    vulnerabilities: isVulnerabilitiesComplete(recommendation, _featureFlags),
    hasVictimsInContactScheme: isVictimContactSchemeComplete(recommendation),
    hasContrabandRisk: hasValue(recommendation.hasContrabandRisk),
    personOnProbation: recommendation.personOnProbation?.hasBeenReviewed === true,
    offenceAnalysis: hasValue(recommendation.offenceAnalysis),
    convictionDetail: recommendation.convictionDetail?.hasBeenReviewed === true,
    mappa: recommendation.personOnProbation?.mappa?.hasBeenReviewed === true,
    currentRoshForPartA: hasValue(recommendation.currentRoshForPartA),
    fixedTermAdditionalLicenceConditions:
      recommendation.recallType?.selected?.value !== 'FIXED_TERM' ||
      hasValue(recommendation.fixedTermAdditionalLicenceConditions),
    indeterminateOrExtendedSentenceDetails: hasValue(recommendation.indeterminateOrExtendedSentenceDetails),
    hasArrestIssues: recommendation.custodyStatus?.selected !== 'NO' || hasValue(recommendation.hasArrestIssues),
    localPoliceContact: hasValue(recommendation.localPoliceContact?.contactName),
    isMainAddressWherePersonCanBeFound:
      recommendation.custodyStatus?.selected !== 'NO' || hasValue(recommendation.isMainAddressWherePersonCanBeFound),
    whoCompletedPartA: hasValue(recommendation.whoCompletedPartA),
    practitionerForPartA: hasValue(recommendation.practitionerForPartA),
    didProbationPractitionerCompletePartA:
      !hasData(recommendation?.whoCompletedPartA) ||
      recommendation.whoCompletedPartA.isPersonProbationPractitionerForOffender,
    revocationOrderRecipients:
      hasValue(recommendation.revocationOrderRecipients) && recommendation.revocationOrderRecipients.length > 0,
    ppcsQueryEmails: hasValue(recommendation.ppcsQueryEmails) && recommendation.ppcsQueryEmails.length > 0,
  }

  const indeterminateOrExtendedSentenceDetails =
    ![SentenceGroup.INDETERMINATE, SentenceGroup.EXTENDED].includes(recommendation.sentenceGroup) ||
    statuses.indeterminateOrExtendedSentenceDetails

  return {
    statuses,
    isReadyForCounterSignature:
      statuses.alternativesToRecallTried &&
      statuses.recallType &&
      statuses.sentenceGroup &&
      suitabilityForRecallValidation &&
      statuses.licenceConditionsBreached &&
      statuses.custodyStatus &&
      statuses.whatLedToRecall &&
      statuses.isThisAnEmergencyRecall &&
      statuses.vulnerabilities &&
      statuses.hasVictimsInContactScheme &&
      statuses.hasContrabandRisk &&
      statuses.personOnProbation &&
      statuses.offenceAnalysis &&
      statuses.convictionDetail &&
      statuses.mappa &&
      statuses.previousReleases &&
      statuses.currentRoshForPartA &&
      statuses.hasArrestIssues &&
      statuses.localPoliceContact &&
      statuses.whoCompletedPartA &&
      (statuses.didProbationPractitionerCompletePartA || statuses.practitionerForPartA) &&
      statuses.isMainAddressWherePersonCanBeFound &&
      indeterminateSentenceValidation &&
      indeterminateOrExtendedSentenceDetails &&
      statuses.fixedTermAdditionalLicenceConditions,
    areAllComplete:
      statuses.alternativesToRecallTried &&
      statuses.recallType &&
      statuses.decisionDateTime &&
      statuses.sentenceGroup &&
      suitabilityForRecallValidation &&
      statuses.licenceConditionsBreached &&
      statuses.custodyStatus &&
      statuses.whatLedToRecall &&
      statuses.isThisAnEmergencyRecall &&
      statuses.vulnerabilities &&
      statuses.hasVictimsInContactScheme &&
      statuses.hasContrabandRisk &&
      statuses.personOnProbation &&
      statuses.offenceAnalysis &&
      statuses.convictionDetail &&
      statuses.mappa &&
      statuses.previousReleases &&
      statuses.currentRoshForPartA &&
      statuses.hasArrestIssues &&
      statuses.localPoliceContact &&
      statuses.whoCompletedPartA &&
      (statuses.didProbationPractitionerCompletePartA || statuses.practitionerForPartA) &&
      statuses.revocationOrderRecipients &&
      statuses.ppcsQueryEmails &&
      statuses.isMainAddressWherePersonCanBeFound &&
      indeterminateSentenceValidation &&
      indeterminateOrExtendedSentenceDetails &&
      statuses.fixedTermAdditionalLicenceConditions,
  }
}
