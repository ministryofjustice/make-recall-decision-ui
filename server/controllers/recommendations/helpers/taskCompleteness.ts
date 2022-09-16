import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { isNotNull } from '../../../utils/utils'
import { ObjectMap } from '../../../@types'

const isVictimContactSchemeComplete = (recommendation: RecommendationResponse) => {
  if (recommendation.hasVictimsInContactScheme === null) {
    return false
  }
  if (recommendation.hasVictimsInContactScheme?.selected === 'YES') {
    return isNotNull(recommendation.dateVloInformed)
  }
  return isNotNull(recommendation.hasVictimsInContactScheme?.selected)
}

const areAllTasksComplete = ({
  statuses,
  recommendation,
}: {
  statuses: ObjectMap<boolean>
  recommendation: RecommendationResponse
}) => {
  let statusesToCheck = Object.keys(statuses)
  // custody status
  if (['YES_POLICE', 'YES_PRISON'].includes(recommendation.custodyStatus?.selected as string)) {
    statusesToCheck = statusesToCheck.filter(key => !['hasArrestIssues', 'localPoliceContact'].includes(key))
  }
  // active custodial convictions
  if (recommendation.activeCustodialConvictionCount !== 1) {
    statusesToCheck = statusesToCheck.filter(key => key !== 'licenceConditionsBreached')
  }
  // determinate sentence
  if (recommendation.isIndeterminateSentence === false) {
    statusesToCheck = statusesToCheck.filter(key => key !== 'indeterminateSentenceType')
  }
  // indeterminate sentence
  if (recommendation.isIndeterminateSentence === true) {
    statusesToCheck = statusesToCheck.filter(key => key !== 'fixedTermAdditionalLicenceConditions')
  }
  return statusesToCheck.every(key => Boolean(statuses[key]))
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
    isIndeterminateSentence: isNotNull(recommendation.isIndeterminateSentence),
    isExtendedSentence: isNotNull(recommendation.isExtendedSentence),
    indeterminateSentenceType: isNotNull(recommendation.indeterminateSentenceType),
    vulnerabilities: isNotNull(recommendation.vulnerabilities) && recommendation.vulnerabilities.selected?.length > 0,
    hasVictimsInContactScheme: isVictimContactSchemeComplete(recommendation),
    custodyStatus: isNotNull(recommendation.custodyStatus) && isNotNull(recommendation.custodyStatus.selected),
    localPoliceContact:
      isNotNull(recommendation.localPoliceContact) && isNotNull(recommendation.localPoliceContact.contactName),
    isUnderIntegratedOffenderManagement:
      isNotNull(recommendation.isUnderIntegratedOffenderManagement) &&
      isNotNull(recommendation.isUnderIntegratedOffenderManagement.selected),
    hasArrestIssues: isNotNull(recommendation.hasArrestIssues),
    fixedTermAdditionalLicenceConditions: isNotNull(recommendation.fixedTermAdditionalLicenceConditions),
    hasContrabandRisk: isNotNull(recommendation.hasContrabandRisk),
  }
  const areAllComplete = areAllTasksComplete({ statuses, recommendation })
  return {
    statuses,
    areAllComplete,
  }
}
