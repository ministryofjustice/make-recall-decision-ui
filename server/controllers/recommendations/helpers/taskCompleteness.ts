import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { isNotNullOrUndefined } from '../../../utils/utils'
import { ObjectMap } from '../../../@types'

const isVictimContactSchemeComplete = (recommendation: RecommendationResponse) => {
  if (recommendation.hasVictimsInContactScheme === null) {
    return false
  }
  if (recommendation.hasVictimsInContactScheme?.selected === 'YES') {
    return isNotNullOrUndefined(recommendation.dateVloInformed)
  }
  return isNotNullOrUndefined(recommendation.hasVictimsInContactScheme?.selected)
}

const removeStatusChecks = ({ allStatusKeys, keysToRemove }: { allStatusKeys: string[]; keysToRemove: string[] }) =>
  allStatusKeys.filter(key => !keysToRemove.includes(key))

const areAllTasksComplete = ({
  statuses,
  recommendation,
}: {
  statuses: ObjectMap<boolean>
  recommendation: RecommendationResponse
}) => {
  let allStatusKeys = Object.keys(statuses)
  const isRecallTypeFixedTerm = recommendation.recallType && recommendation.recallType?.selected?.value === 'FIXED_TERM'
  // custody status
  if (['YES_POLICE', 'YES_PRISON'].includes(recommendation.custodyStatus?.selected as string)) {
    allStatusKeys = removeStatusChecks({ allStatusKeys, keysToRemove: ['hasArrestIssues', 'localPoliceContact'] })
  }
  // active custodial convictions
  if (recommendation.activeCustodialConvictionCount !== 1) {
    allStatusKeys = removeStatusChecks({ allStatusKeys, keysToRemove: ['licenceConditionsBreached'] })
  }
  // determinate sentence
  if (recommendation.isIndeterminateSentence === false) {
    allStatusKeys = removeStatusChecks({
      allStatusKeys,
      keysToRemove: ['indeterminateSentenceType', 'indeterminateOrExtendedSentenceDetails'],
    })
  }
  // indeterminate sentence
  if (recommendation.isIndeterminateSentence === true || !isRecallTypeFixedTerm) {
    allStatusKeys = removeStatusChecks({ allStatusKeys, keysToRemove: ['fixedTermAdditionalLicenceConditions'] })
  }
  return allStatusKeys.every(key => Boolean(statuses[key]))
}

export const taskCompleteness = (recommendation: RecommendationResponse) => {
  const statuses = {
    recallType: isNotNullOrUndefined(recommendation.recallType?.selected),
    alternativesToRecallTried: recommendation.alternativesToRecallTried?.selected?.length > 0,
    responseToProbation: isNotNullOrUndefined(recommendation.responseToProbation),
    whatLedToRecall: isNotNullOrUndefined(recommendation.whatLedToRecall),
    licenceConditionsBreached:
      recommendation.licenceConditionsBreached?.standardLicenceConditions?.selected?.length > 0 ||
      recommendation.licenceConditionsBreached?.additionalLicenceConditions?.selected?.length > 0,
    isThisAnEmergencyRecall: isNotNullOrUndefined(recommendation.isThisAnEmergencyRecall),
    isIndeterminateSentence: isNotNullOrUndefined(recommendation.isIndeterminateSentence),
    isExtendedSentence: isNotNullOrUndefined(recommendation.isExtendedSentence),
    vulnerabilities: recommendation.vulnerabilities?.selected?.length > 0,
    hasVictimsInContactScheme: isVictimContactSchemeComplete(recommendation),
    custodyStatus: isNotNullOrUndefined(recommendation.custodyStatus),
    localPoliceContact: isNotNullOrUndefined(recommendation.localPoliceContact?.contactName),
    isUnderIntegratedOffenderManagement: isNotNullOrUndefined(
      recommendation.isUnderIntegratedOffenderManagement?.selected
    ),
    hasArrestIssues: isNotNullOrUndefined(recommendation.hasArrestIssues),
    hasContrabandRisk: isNotNullOrUndefined(recommendation.hasContrabandRisk),
    // optional fields, depending on indeterminate sentence status
    indeterminateSentenceType: isNotNullOrUndefined(recommendation.indeterminateSentenceType),
    indeterminateOrExtendedSentenceDetails: isNotNullOrUndefined(recommendation.indeterminateOrExtendedSentenceDetails),
    fixedTermAdditionalLicenceConditions: isNotNullOrUndefined(recommendation.fixedTermAdditionalLicenceConditions),
  }
  const areAllComplete = areAllTasksComplete({ statuses, recommendation })
  return {
    statuses,
    areAllComplete,
  }
}
