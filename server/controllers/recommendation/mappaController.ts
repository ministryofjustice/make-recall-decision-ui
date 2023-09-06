import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { updatePageReviewedStatus } from '../recommendations/helpers/updatePageReviewedStatus'
import config from '../../config'

async function get(req: Request, res: Response, next: NextFunction) {
  res.locals.notification = {
    ...config.notification,
    isVisible: config.notification.body && config.notification.active,
  }
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
