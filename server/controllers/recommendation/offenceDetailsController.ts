import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { updatePageReviewedStatus } from '../recommendations/helpers/updatePageReviewedStatus'
import { fetchAndTransformLicenceConditions } from '../recommendations/licenceConditions/transform'

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
    propertyToRefresh: 'convictionDetail',
  })

  res.locals = {
    ...res.locals,
    recommendation,
    crn: recommendation.crn,
    recommendationStatus: recommendation.status,
    page: {
      id: 'offenceDetails',
    },
  }

  res.locals.caseSummary = await fetchAndTransformLicenceConditions({
    crn: recommendation.crn,
    token,
  })

  await updatePageReviewedStatus({
    reviewedProperty: 'convictionDetail',
    recommendationId,
    token,
  })

  res.render(`pages/recommendations/offenceDetails`)
  next()
}

export default { get }
