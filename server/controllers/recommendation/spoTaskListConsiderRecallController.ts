import { NextFunction, Request, Response } from 'express'
import { hasData } from '../../utils/utils'
import { RecommendationStatusResponse } from '../../@types/make-recall-decision-api/models/RecommendationStatusReponse'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  const reviewPractitionersConcernsCompleted = hasData(recommendation.reviewPractitionersConcerns)
  const reviewOffenderProfileCompleted = hasData(recommendation.reviewOffenderProfile)
  const explainTheDecisionCompleted = hasData(recommendation.explainTheDecision)

  const isSpoSignatureRequested = (res.locals.statuses as RecommendationStatusResponse[])
    .filter(status => status.active)
    .find(status => status.name === STATUSES.SPO_SIGNATURE_REQUESTED)

  const allTasksCompleted =
    reviewPractitionersConcernsCompleted && reviewOffenderProfileCompleted && explainTheDecisionCompleted

  res.locals = {
    ...res.locals,
    isSpoSignatureRequested,
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
