import { DateTime } from 'luxon'
import { RiskManagementPlan } from '../../../@types/make-recall-decision-api'
import { europeLondon } from '../../../utils/dates'
import logger from '../../../../logger'

interface Decorated extends RiskManagementPlan {
  lastCompletedAssessmentAtLeastTwentyTwoWeeksOld?: boolean
  recentIncompleteAssessment?: boolean
}
export const transformRiskManagementPlan = (riskManagementPlan: RiskManagementPlan): Decorated => {
  const { latestDateCompleted, initiationDate } = riskManagementPlan
  const twentyTwoWeeksAgo = DateTime.now().minus({ week: 22 })
  try {
    const lastAssessmentMoreThanTwentyTwoWeeksOld =
      DateTime.fromISO(latestDateCompleted, { zone: europeLondon }) <= twentyTwoWeeksAgo
    const recentIncompleteAssessment = DateTime.fromISO(initiationDate, { zone: europeLondon }) > twentyTwoWeeksAgo
    return {
      ...riskManagementPlan,
      lastCompletedAssessmentAtLeastTwentyTwoWeeksOld:
        riskManagementPlan.assessmentStatusComplete && lastAssessmentMoreThanTwentyTwoWeeksOld,
      recentIncompleteAssessment: riskManagementPlan.assessmentStatusComplete === false && recentIncompleteAssessment,
    }
  } catch (err) {
    logger.info(err)
    return riskManagementPlan
  }
}
