import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { updatePageReviewedStatus } from '../recommendations/helpers/updatePageReviewedStatus'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    user: { token },
    flags: featureFlags,
  } = res.locals

  const recommendation = await updateRecommendation({
    recommendationId,
    token,
    featureFlags,
    propertyToRefresh: 'mappa',
  })

  res.locals = {
    ...res.locals,
    recommendation,
    page: {
      id: 'mappa',
    },
  }

  await updatePageReviewedStatus({
    reviewedProperty: 'mappa',
    recommendationId,
    token,
  })

  res.render(`pages/recommendations/mappa`)
  next()
}

export default { get }
