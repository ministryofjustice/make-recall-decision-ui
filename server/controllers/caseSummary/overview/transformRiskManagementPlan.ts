import { DateTime } from 'luxon'
import { RiskManagementPlan } from '../../../@types/make-recall-decision-api'
import { europeLondon } from '../../../utils/dates'
import logger from '../../../../logger'

interface Decorated extends RiskManagementPlan {
  lastCompletedAssessmentAtLeastTwentyTwoWeeksOld?: boolean
  incompleteAssessment?: boolean
}
export const transformRiskManagementPlan = (riskManagementPlan: RiskManagementPlan): Decorated => {
  const { latestDateCompleted } = riskManagementPlan
  if (!latestDateCompleted) {
    return riskManagementPlan
  }
  const twentyTwoWeeksAgo = DateTime.now().minus({ week: 22 })
  try {
    const lastAssessmentMoreThanTwentyTwoWeeksOld =
      DateTime.fromISO(latestDateCompleted, { zone: europeLondon }) <= twentyTwoWeeksAgo
    return {
      ...riskManagementPlan,
      lastCompletedAssessmentAtLeastTwentyTwoWeeksOld: lastAssessmentMoreThanTwentyTwoWeeksOld,
      incompleteAssessment: riskManagementPlan.assessmentStatusComplete === false,
    }
  } catch (err) {
    logger.info(err)
    return riskManagementPlan
  }
}
