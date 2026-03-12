import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import updatePageReviewedStatus from '../recommendations/helpers/updatePageReviewedStatus'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    recommendation: {
      personOnProbation: { mappa },
    },
    user: { token },
    flags: featureFlags,
  } = res.locals

  const valuesToSave = {
    isMappaLevel2Or3: mappa?.mappaLevel >= 2,
    isMappaCategory4: mappa?.category === 4,
  }

  const recommendation = await updateRecommendation({
    recommendationId,
    token,
    featureFlags,
    valuesToSave,
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
