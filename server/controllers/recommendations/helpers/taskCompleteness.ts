import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { isNotNull } from '../../../utils/utils'

const isVictimContactSchemeComplete = (recommendation: RecommendationResponse) => {
  if (recommendation.hasVictimsInContactScheme === null) {
    return false
  }
  if (recommendation.hasVictimsInContactScheme?.selected === 'YES') {
    return isNotNull(recommendation.dateVloInformed)
  }
  return isNotNull(recommendation.hasVictimsInContactScheme?.selected)
}

export const taskCompleteness = (recommendation: RecommendationResponse) => {
  const statuses = {
    recallType: isNotNull(recommendation.recallType) && isNotNull(recommendation.recallType.selected),
    alternativesToRecallTried:
      isNotNull(recommendation.alternativesToRecallTried) &&
      recommendation.alternativesToRecallTried.selected?.length > 0,
    responseToProbation: isNotNull(recommendation.responseToProbation),
    whatLedToRecall: isNotNull(recommendation.whatLedToRecall),
    licenceConditionsBreached:
      isNotNull(recommendation.licenceConditionsBreached) &&
      (recommendation.licenceConditionsBreached.standardLicenceConditions?.selected?.length > 0 ||
        recommendation.licenceConditionsBreached.additionalLicenceConditions?.selected?.length > 0),
    isThisAnEmergencyRecall: isNotNull(recommendation.isThisAnEmergencyRecall),
    vulnerabilities: isNotNull(recommendation.vulnerabilities) && recommendation.vulnerabilities.selected?.length > 0,
    hasVictimsInContactScheme: isVictimContactSchemeComplete(recommendation),
    custodyStatus: isNotNull(recommendation.custodyStatus) && isNotNull(recommendation.custodyStatus.selected),
    localPoliceContact:
      isNotNull(recommendation.localPoliceContact) && isNotNull(recommendation.localPoliceContact.contactName),
    isUnderIntegratedOffenderManagement:
      isNotNull(recommendation.isUnderIntegratedOffenderManagement) &&
      isNotNull(recommendation.isUnderIntegratedOffenderManagement.selected),
    hasArrestIssues: isNotNull(recommendation.hasArrestIssues),
    hasContrabandRisk: isNotNull(recommendation.hasContrabandRisk),
  }
  const areAllComplete = Object.values(statuses).every(Boolean)
  return {
    statuses,
    areAllComplete,
  }
}
