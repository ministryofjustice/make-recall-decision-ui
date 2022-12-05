import { RecommendationResponse } from '../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { RecallTypeSelectedValue } from '../../../@types/make-recall-decision-api/models/RecallTypeSelectedValue'
import { isNotNullOrUndefined } from '../../../utils/utils'
import { FeatureFlags } from '../../../@types'

const isVictimContactSchemeComplete = (recommendation: RecommendationResponse) => {
  if (recommendation.hasVictimsInContactScheme === null) {
    return false
  }
  if (recommendation.hasVictimsInContactScheme?.selected === 'YES') {
    return isNotNullOrUndefined(recommendation.dateVloInformed)
  }
  return isNotNullOrUndefined(recommendation.hasVictimsInContactScheme?.selected)
}

export const taskCompleteness = (recommendation: RecommendationResponse, featureFlags?: FeatureFlags) => {
  const isRecall = [RecallTypeSelectedValue.value.STANDARD, RecallTypeSelectedValue.value.FIXED_TERM].includes(
    recommendation.recallType?.selected?.value
  )
  const isNoRecall = recommendation.recallType?.selected?.value === RecallTypeSelectedValue.value.NO_RECALL

  let statuses: { [index: string]: boolean } = {
    alternativesToRecallTried: recommendation.alternativesToRecallTried?.selected?.length > 0,
    recallType: isNotNullOrUndefined(recommendation.recallType?.selected),
    responseToProbation: isNotNullOrUndefined(recommendation.responseToProbation),
    isIndeterminateSentence: isNotNullOrUndefined(recommendation.isIndeterminateSentence),
    isExtendedSentence: isNotNullOrUndefined(recommendation.isExtendedSentence),
  }

  const recallStatuses = {
    custodyStatus: isNotNullOrUndefined(recommendation.custodyStatus),
    whatLedToRecall: isNotNullOrUndefined(recommendation.whatLedToRecall),
    isThisAnEmergencyRecall: isNotNullOrUndefined(recommendation.isThisAnEmergencyRecall),
    vulnerabilities: recommendation.vulnerabilities?.selected?.length > 0,
    hasVictimsInContactScheme: isVictimContactSchemeComplete(recommendation),
    isUnderIntegratedOffenderManagement: isNotNullOrUndefined(
      recommendation.isUnderIntegratedOffenderManagement?.selected
    ),
    hasContrabandRisk: isNotNullOrUndefined(recommendation.hasContrabandRisk),
    personOnProbation: recommendation.personOnProbation?.hasBeenReviewed === true,
    ...(featureFlags?.flagRecommendationOffenceDetails === true
      ? {
          offenceAnalysis: isNotNullOrUndefined(recommendation.offenceAnalysis),
          convictionDetail: recommendation.convictionDetail?.hasBeenReviewed === true,
          mappa: recommendation.personOnProbation?.mappa?.hasBeenReviewed === true,
          previousReleases: isNotNullOrUndefined(recommendation.previousReleases),
        }
      : {}),
  }

  const noRecallStatuses = {
    whyConsideredRecall: isNotNullOrUndefined(recommendation.whyConsideredRecall),
    reasonsForNoRecall: isNotNullOrUndefined(recommendation.reasonsForNoRecall),
    nextAppointment: isNotNullOrUndefined(recommendation.nextAppointment),
  }

  if (recommendation.activeCustodialConvictionCount === 1) {
    statuses.licenceConditionsBreached =
      recommendation.licenceConditionsBreached?.standardLicenceConditions?.selected?.length > 0 ||
      recommendation.licenceConditionsBreached?.additionalLicenceConditions?.selected?.length > 0
  }

  if (recommendation.isIndeterminateSentence === true) {
    statuses.indeterminateSentenceType = isNotNullOrUndefined(recommendation.indeterminateSentenceType)
  }

  if (isRecall) {
    const isRecallTypeFixedTerm = recommendation.recallType?.selected?.value === 'FIXED_TERM'
    statuses = {
      ...statuses,
      ...recallStatuses,
    }
    if (recommendation.custodyStatus?.selected === 'NO') {
      statuses.hasArrestIssues = isNotNullOrUndefined(recommendation.hasArrestIssues)
      statuses.localPoliceContact = isNotNullOrUndefined(recommendation.localPoliceContact?.contactName)
      statuses.isMainAddressWherePersonCanBeFound = isNotNullOrUndefined(
        recommendation.isMainAddressWherePersonCanBeFound
      )
    }
    if (isRecallTypeFixedTerm) {
      statuses.fixedTermAdditionalLicenceConditions = isNotNullOrUndefined(
        recommendation.fixedTermAdditionalLicenceConditions
      )
    }
    if (recommendation.isIndeterminateSentence === true) {
      statuses.indeterminateOrExtendedSentenceDetails = isNotNullOrUndefined(
        recommendation.indeterminateOrExtendedSentenceDetails
      )
    }
  }

  if (isNoRecall) {
    statuses = {
      ...statuses,
      ...noRecallStatuses,
    }
  }
  const areAllComplete = Object.keys(statuses).every(key => Boolean(statuses[key]))
  return {
    statuses,
    areAllComplete,
  }
}
