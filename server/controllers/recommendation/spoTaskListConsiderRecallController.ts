import { NextFunction, Request, Response } from 'express'
import { hasData } from '../../utils/utils'
import { appInsightsEvent } from '../../monitoring/azureAppInsights'
import { EVENTS } from '../../utils/constants'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const { fromPageId } = req.query
  const {
    flags,
    recommendation,
    user: { username },
  } = res.locals

  const reviewPractitionersConcernsCompleted = hasData(recommendation.reviewPractitionersConcerns)
  const reviewOffenderProfileCompleted = hasData(recommendation.reviewOffenderProfile)
  const explainTheDecisionCompleted = hasData(recommendation.explainTheDecision)

  const allTasksCompleted =
    reviewPractitionersConcernsCompleted && reviewOffenderProfileCompleted && explainTheDecisionCompleted

  res.locals = {
    ...res.locals,
    backLink:
      fromPageId === 'rationale-check'
        ? `/recommendations/${recommendationId}/rationale-check`
        : `/cases/${recommendation.crn}/overview`,
    crn: recommendation.crn,
    reviewPractitionersConcernsCompleted,
    reviewOffenderProfileCompleted,
    explainTheDecisionCompleted,
    allTasksCompleted,
    page: {
      id: 'spoTaskListConsiderRecall',
    },
  }

  appInsightsEvent(
    EVENTS.MRD_SPO_RATIONALE_TASKLIST_ACCESSED,
    username,
    {
      crn: recommendation.crn,
      recommendationId,
    },
    flags
  )

  res.render(`pages/recommendations/spoTaskListConsiderRecall`)
  next()
}

export default { get }
