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
    propertyToRefresh: 'personOnProbation',
  })

  res.locals = {
    ...res.locals,
    recommendation,
    page: {
      id: 'personalDetails',
    },
  }

  await updatePageReviewedStatus({
    reviewedProperty: 'personOnProbation',
    recommendationId,
    token,
  })

  res.render(`pages/recommendations/personalDetails`)
  next()
}

export default { get }
