import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { sharedPaths } from '../../routes/paths/shared.paths'

async function get(req: Request, res: Response, next: NextFunction) {
  const { recommendationId } = req.params
  const {
    user: { token },
    flags,
  } = res.locals

  const recommendation = await updateRecommendation({
    recommendationId,
    token,
    featureFlags: flags,
    propertyToRefresh: 'previousReleases',
  })

  res.locals = {
    ...res.locals,
    recommendation,
    page: {
      id: 'releaseDetails',
    },
  }

  res.render('pages/recommendations/releaseDetails')

  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  await updateRecommendation({
    recommendationId,
    valuesToSave: {
      previousReleases: {
        hasBeenReleasedPreviously: req.body.continueButton === '1',
      },
      dateOfRelease: req.body.dateOfRelease,
    },
    token,
    featureFlags: flags,
  })

  const nextPagePath = `${sharedPaths.recommendations}/${recommendationId}/task-list#heading-person-details`

  return res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
