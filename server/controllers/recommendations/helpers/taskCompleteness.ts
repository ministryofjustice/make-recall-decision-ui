import { RecommendationResponse } from '../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { RecallTypeSelectedValue } from '../../../@types/make-recall-decision-api/models/RecallTypeSelectedValue'
import { hasData, hasValue, isEmptyStringOrWhitespace } from '../../../utils/utils'
import { FeatureFlags } from '../../../@types/featureFlags'
import { VULNERABILITY } from '../vulnerabilities/formOptions'
import { vulnerabilityRequiresDetails } from '../vulnerabilitiesDetails/formValidator'

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

const isPreviousRecallsComplete = (recommendation: RecommendationResponse) => {
  if (recommendation.previousRecalls === null || typeof recommendation.previousRecalls === 'undefined') {
    return false
  }
  if (recommendation.previousRecalls?.hasBeenRecalledPreviously === true) {
    return recommendation.previousRecalls?.previousRecallDates?.length > 0
  }
  return recommendation.previousRecalls?.hasBeenRecalledPreviously === false
}

const isVulnerabilitiesComplete = (recommendation: RecommendationResponse, _featureFlags?: FeatureFlags) => {
  if (recommendation.vulnerabilities === null || typeof recommendation.vulnerabilities === 'undefined') {
    return false
  }
  if (!!_featureFlags?.flagRiskToSelfEnabled === true) {
    return recommendation.vulnerabilities?.selected?.length > 0 && hasAllRequiredVulnerabilityDetails(recommendation)
  }

  return recommendation.vulnerabilities?.selected?.length > 0
}

export const hasAllRequiredVulnerabilityDetails = (recommendation: RecommendationResponse): boolean => {
  const selectedVulnerabilities = recommendation.vulnerabilities?.selected
  return (
    !selectedVulnerabilities ||
    !selectedVulnerabilities.some(
      valueWithDetails =>
        vulnerabilityRequiresDetails(valueWithDetails.value as VULNERABILITY) &&
        isEmptyStringOrWhitespace(valueWithDetails?.details)
    )
  )
}

export const taskCompleteness = (recommendation: RecommendationResponse, _featureFlags?: FeatureFlags) => {
  let statuses: Record<string, boolean> = {
    alternativesToRecallTried: hasData(recommendation.alternativesToRecallTried?.selected),
    recallType: hasValue(recommendation.recallType?.selected),
    decisionDateTime: hasValue(recommendation.decisionDateTime),
    responseToProbation: hasValue(recommendation.responseToProbation),
    isIndeterminateSentence: hasValue(recommendation.isIndeterminateSentence),
    isExtendedSentence: hasValue(recommendation.isExtendedSentence),
    previousReleases: isPreviousReleasesComplete(recommendation),
    previousRecalls: isPreviousRecallsComplete(recommendation),
    indeterminateSentenceType:
      !!recommendation.isIndeterminateSentence && hasValue(recommendation.indeterminateSentenceType),
    licenceConditionsBreached:
      hasData(recommendation.licenceConditionsBreached?.standardLicenceConditions?.selected) ||
      hasData(recommendation.licenceConditionsBreached?.additionalLicenceConditions?.selectedOptions) ||
      hasData(recommendation.cvlLicenceConditionsBreached?.standardLicenceConditions?.selected) ||
      hasData(recommendation.cvlLicenceConditionsBreached?.additionalLicenceConditions?.selected) ||
      hasData(recommendation.cvlLicenceConditionsBreached?.bespokeLicenceConditions?.selected) ||
      hasData(recommendation.additionalLicenceConditionsText),
  }

  if (recommendation.recallType?.selected?.value === RecallTypeSelectedValue.value.NO_RECALL) {
    const whyConsideredRecall = hasValue(recommendation.whyConsideredRecall)
    const reasonsForNoRecall = hasValue(recommendation.reasonsForNoRecall)
    const nextAppointment = hasValue(recommendation.nextAppointment)

    return {
      statuses: {
        ...statuses,
        whyConsideredRecall,
        reasonsForNoRecall,
        nextAppointment,
      },
      isReadyForCounterSignature: false,
      areAllComplete:
        statuses.alternativesToRecallTried &&
        statuses.recallType &&
        statuses.responseToProbation &&
        statuses.isIndeterminateSentence &&
        statuses.isExtendedSentence &&
        statuses.licenceConditionsBreached &&
        (!recommendation.isIndeterminateSentence || statuses.indeterminateSentenceType) &&
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
    isUnderIntegratedOffenderManagement: hasValue(recommendation.isUnderIntegratedOffenderManagement?.selected),
    hasContrabandRisk: hasValue(recommendation.hasContrabandRisk),
    personOnProbation: recommendation.personOnProbation?.hasBeenReviewed === true,
    offenceAnalysis: hasValue(recommendation.offenceAnalysis),
    convictionDetail: recommendation.convictionDetail?.hasBeenReviewed === true,
    mappa: recommendation.personOnProbation?.mappa?.hasBeenReviewed === true,
    currentRoshForPartA: hasValue(recommendation.currentRoshForPartA),
    fixedTermAdditionalLicenceConditions:
      recommendation.recallType?.selected?.value !== 'FIXED_TERM' ||
      hasValue(recommendation.fixedTermAdditionalLicenceConditions),
    indeterminateOrExtendedSentenceDetails:
      recommendation.isIndeterminateSentence === false ||
      hasValue(recommendation.indeterminateOrExtendedSentenceDetails),
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

  return {
    statuses,
    isReadyForCounterSignature:
      statuses.alternativesToRecallTried &&
      statuses.recallType &&
      statuses.responseToProbation &&
      statuses.isIndeterminateSentence &&
      statuses.isExtendedSentence &&
      statuses.licenceConditionsBreached &&
      statuses.custodyStatus &&
      statuses.whatLedToRecall &&
      statuses.isThisAnEmergencyRecall &&
      statuses.vulnerabilities &&
      statuses.hasVictimsInContactScheme &&
      statuses.isUnderIntegratedOffenderManagement &&
      statuses.hasContrabandRisk &&
      statuses.personOnProbation &&
      statuses.offenceAnalysis &&
      statuses.convictionDetail &&
      statuses.mappa &&
      statuses.previousReleases &&
      statuses.previousRecalls &&
      statuses.currentRoshForPartA &&
      statuses.hasArrestIssues &&
      statuses.localPoliceContact &&
      statuses.whoCompletedPartA &&
      (statuses.didProbationPractitionerCompletePartA || statuses.practitionerForPartA) &&
      statuses.isMainAddressWherePersonCanBeFound &&
      (!recommendation.isIndeterminateSentence || statuses.indeterminateSentenceType) &&
      (!recommendation.isIndeterminateSentence || statuses.indeterminateOrExtendedSentenceDetails) &&
      statuses.fixedTermAdditionalLicenceConditions,
    areAllComplete:
      statuses.alternativesToRecallTried &&
      statuses.recallType &&
      statuses.decisionDateTime &&
      statuses.responseToProbation &&
      statuses.isIndeterminateSentence &&
      statuses.isExtendedSentence &&
      statuses.licenceConditionsBreached &&
      statuses.custodyStatus &&
      statuses.whatLedToRecall &&
      statuses.isThisAnEmergencyRecall &&
      statuses.vulnerabilities &&
      statuses.hasVictimsInContactScheme &&
      statuses.isUnderIntegratedOffenderManagement &&
      statuses.hasContrabandRisk &&
      statuses.personOnProbation &&
      statuses.offenceAnalysis &&
      statuses.convictionDetail &&
      statuses.mappa &&
      statuses.previousReleases &&
      statuses.previousRecalls &&
      statuses.currentRoshForPartA &&
      statuses.hasArrestIssues &&
      statuses.localPoliceContact &&
      statuses.whoCompletedPartA &&
      (statuses.didProbationPractitionerCompletePartA || statuses.practitionerForPartA) &&
      statuses.revocationOrderRecipients &&
      statuses.ppcsQueryEmails &&
      statuses.isMainAddressWherePersonCanBeFound &&
      (!recommendation.isIndeterminateSentence || statuses.indeterminateSentenceType) &&
      (!recommendation.isIndeterminateSentence || statuses.indeterminateOrExtendedSentenceDetails) &&
      statuses.fixedTermAdditionalLicenceConditions,
  }
}
