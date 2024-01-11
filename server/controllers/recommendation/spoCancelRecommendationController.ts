import { NextFunction, Request, Response } from 'express'
import { getStatuses } from '../../data/makeDecisionApiClient'
import { STATUSES } from '../../middleware/recommendationStatusCheck'

async function get(req: Request, res: Response, next: NextFunction) {
  let id: string
  let bodyText: string
  let buttonText: string
  let headingText: string

  const statuses = (
    await getStatuses({
      recommendationId: String(res.locals.recommendation.id),
      token: res.locals.user.token,
    })
  ).filter(status => status.active)

  const backLink = `/cases/${res.locals.recommendation.crn}/overview`

  const isDoNotRecall = statuses.find(status => status.name === STATUSES.NO_RECALL_DECIDED)
  const isRecallDecided = statuses.find(status => status.name === STATUSES.RECALL_DECIDED)

  if (isDoNotRecall) {
    id = 'cancelDntrRationale'
    headingText = 'decision not to recall'
    bodyText = 'cancel this decision not to recall'
    buttonText = 'Cancel decision not to recall'
  } else if (isRecallDecided) {
    id = 'cancelPartARationale'
    headingText = 'Part A'
    bodyText = 'cancel this Part A'
    buttonText = 'Cancel Part A'
  } else {
    // to capture legacy recommendations and any new ones that have status STATUSES.PO_START_RECALL
    id = 'cancelRecommendationRationale'
    headingText = 'recommendation'
    bodyText = 'cancel this recommendation'
    buttonText = 'Cancel recommendation'
  }

  res.locals = {
    ...res.locals,
    page: {
      id,
      bodyText,
    },
    headingText,
    buttonText,
    backLink,
  }

  res.render(`pages/recommendations/spoCancelRecommendationRationale`)
  next()
}

export default { get }
