import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { validatePreviousRecalls } from '../recommendations/previousRecalls/formValidator'
import { isDefined } from '../../utils/utils'
import { sharedPaths } from '../../routes/paths/shared.paths'

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
    propertyToRefresh: 'previousRecalls',
  })

  res.locals = {
    ...res.locals,
    recommendation,
    page: {
      id: 'previousRecalls',
    },
  }

  res.render(`pages/recommendations/previousRecalls`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const { errors, valuesToSave, unsavedValues } = await validatePreviousRecalls({
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

  let nextPagePath = `${sharedPaths.recommendations}/${recommendationId}/task-list#heading-person-details`
  const { deletePreviousRecallDateIndex } = req.body
  if (isDefined(deletePreviousRecallDateIndex)) {
    nextPagePath = `${sharedPaths.recommendations}/${recommendationId}/previous-recalls`
  }
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
