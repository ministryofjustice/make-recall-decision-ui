import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { routeUrls } from '../../routes/routeUrls'
import { isDefined } from '../../utils/utils'
import { validatePreviousReleases } from '../recommendations/previousReleases/formValidator'

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
    propertyToRefresh: 'previousReleases',
  })

  res.locals = {
    ...res.locals,
    recommendation,
    page: {
      id: 'previousReleases',
    },
  }

  res.render(`pages/recommendations/previousReleases`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const { errors, valuesToSave, unsavedValues } = await validatePreviousReleases({
    requestBody: req.body,
    recommendationId,
    urlInfo,
    token,
  })

  if (errors) {
    req.session.errors = errors
    req.session.unsavedValues = unsavedValues
    return res.redirect(303, req.originalUrl)
  }

  await updateRecommendation({
    recommendationId,
    valuesToSave,
    token,
    featureFlags: flags,
  })

  let nextPagePath = `${routeUrls.recommendations}/${recommendationId}/task-list#heading-person-details`
  const { deletePreviousReleaseDateIndex } = req.body
  if (isDefined(deletePreviousReleaseDateIndex)) {
    nextPagePath = `${routeUrls.recommendations}/${recommendationId}/previous-releases`
  }
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
