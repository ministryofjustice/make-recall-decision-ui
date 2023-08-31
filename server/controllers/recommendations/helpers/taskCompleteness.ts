import { RecommendationResponse } from '../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { RecallTypeSelectedValue } from '../../../@types/make-recall-decision-api/models/RecallTypeSelectedValue'
import { hasData, hasValue } from '../../../utils/utils'
import { FeatureFlags } from '../../../@types/featureFlags'

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

export const taskCompleteness = (recommendation: RecommendationResponse, _featureFlags?: FeatureFlags) => {
  let statuses: Record<string, boolean> = {
    alternativesToRecallTried: hasData(recommendation.alternativesToRecallTried?.selected),
    recallType: hasValue(recommendation.recallType?.selected),
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
      hasData(recommendation.cvlLicenceConditionsBreached?.bespokeLicenceConditions?.selected),
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
    vulnerabilities: recommendation.vulnerabilities?.selected?.length > 0,
    hasVictimsInContactScheme: isVictimContactSchemeComplete(recommendation),
    isUnderIntegratedOffenderManagement: hasValue(recommendation.isUnderIntegratedOffenderManagement?.selected),
    hasContrabandRisk: hasValue(recommendation.hasContrabandRisk),
    personOnProbation: recommendation.personOnProbation?.hasBeenReviewed === true,
    offenceAnalysis: hasValue(recommendation.offenceAnalysis),
    convictionDetail: recommendation.convictionDetail?.hasBeenReviewed === true,
    mappa: recommendation.personOnProbation?.mappa?.hasBeenReviewed === true,
    previousReleases: isPreviousReleasesComplete(recommendation),
    previousRecalls: isPreviousRecallsComplete(recommendation),
    currentRoshForPartA: hasValue(recommendation.currentRoshForPartA),
    fixedTermAdditionalLicenceConditions:
      recommendation.recallType?.selected?.value !== 'FIXED_TERM' ||
      hasValue(recommendation.fixedTermAdditionalLicenceConditions),
    indeterminateOrExtendedSentenceDetails:
      recommendation.isIndeterminateSentence === false ||
      hasValue(recommendation.indeterminateOrExtendedSentenceDetails),
    hasArrestIssues: recommendation.custodyStatus?.selected !== 'NO' || hasValue(recommendation.hasArrestIssues),
    localPoliceContact:
      recommendation.custodyStatus?.selected !== 'NO' || hasValue(recommendation.localPoliceContact?.contactName),
    isMainAddressWherePersonCanBeFound:
      recommendation.custodyStatus?.selected !== 'NO' || hasValue(recommendation.isMainAddressWherePersonCanBeFound),
    whoCompletedPartA: hasValue(recommendation.whoCompletedPartA),
    practitionerForPartA: hasValue(recommendation.practitionerForPartA),
    didProbationPractitionerCompletePartA:
      !hasData(recommendation?.whoCompletedPartA) ||
      recommendation.whoCompletedPartA.isPersonProbationPractitionerForOffender,
  }

  const flagProbationAdmin = _featureFlags?.flagProbationAdmin

  return {
    statuses,
    areAllComplete:
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
      // when we implement the following stories, we can set these statuses.
      (!flagProbationAdmin || statuses.whoCompletedPartA) &&
      (!flagProbationAdmin || statuses.didProbationPractitionerCompletePartA || statuses.practitionerForPartA) &&
      // (!flagProbationAdmin || statuses.revocationContact) &&
      // (!flagProbationAdmin || statuses.correspondenceEmail) &&
      statuses.isMainAddressWherePersonCanBeFound &&
      (!recommendation.isIndeterminateSentence || statuses.indeterminateSentenceType) &&
      (!recommendation.isIndeterminateSentence || statuses.indeterminateOrExtendedSentenceDetails) &&
      statuses.fixedTermAdditionalLicenceConditions,
  }
}
