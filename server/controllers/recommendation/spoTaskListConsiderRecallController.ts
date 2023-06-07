import { NextFunction, Request, Response } from 'express'
import { hasData } from '../../utils/utils'
import { STATUSES } from '../../middleware/recommendationStatusCheck'
import { getStatuses, updateStatuses } from '../../data/makeDecisionApiClient'
import { HMPPS_AUTH_ROLE } from '../../middleware/authorisationMiddleware'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    recommendation,
    user: { token, roles },
  } = res.locals

  const reviewPractitionersConcernsCompleted = hasData(recommendation.reviewPractitionersConcerns)
  const reviewOffenderProfileCompleted = hasData(recommendation.reviewOffenderProfile)
  const explainTheDecisionCompleted = hasData(recommendation.explainTheDecision)

  const allTasksCompleted =
    reviewPractitionersConcernsCompleted && reviewOffenderProfileCompleted && explainTheDecisionCompleted

  const statuses = (
    await getStatuses({
      recommendationId,
      token,
    })
  ).filter(status => status.active)

  const isSpo = roles.includes(HMPPS_AUTH_ROLE.SPO)
  const isSpoConsiderRecall = statuses.find(status => status.name === STATUSES.SPO_CONSIDER_RECALL)
  const isSpoConsideringRecall = statuses.find(status => status.name === STATUSES.SPO_CONSIDERING_RECALL)

  if (isSpoConsiderRecall && !isSpoConsideringRecall && isSpo) {
    await updateStatuses({
      recommendationId,
      token,
      activate: [STATUSES.SPO_CONSIDERING_RECALL],
      deActivate: [STATUSES.SPO_CONSIDER_RECALL],
    })
  }

  res.locals = {
    ...res.locals,
    crn: recommendation.crn,
    reviewPractitionersConcernsCompleted,
    reviewOffenderProfileCompleted,
    explainTheDecisionCompleted,
    allTasksCompleted,
    page: {
      id: 'spoTaskListConsiderRecall',
    },
  }

  res.render(`pages/recommendations/spoTaskListConsiderRecall`)
  next()
}

export default { get }
