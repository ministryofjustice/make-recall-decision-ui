import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { routeUrls } from '../../routes/routeUrls'
import { inputDisplayValuesAddPreviousRecall } from '../recommendations/addPreviousRecall/inputDisplayValues'
import { validateAddPreviousRecall } from '../recommendations/addPreviousRecall/formValidator'

function get(req: Request, res: Response, next: NextFunction) {
  const { recommendation } = res.locals

  res.locals = {
    ...res.locals,
    page: {
      id: 'addPreviousRecall',
    },
  }

  res.locals.inputDisplayValues = inputDisplayValuesAddPreviousRecall({
    errors: res.locals.errors,
    unsavedValues: res.locals.unsavedValues,
    apiValues: recommendation,
  })

  res.render(`pages/recommendations/addPreviousRecall`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const { errors, valuesToSave, unsavedValues } = await validateAddPreviousRecall({
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

  const nextPagePath = `${routeUrls.recommendations}/${recommendationId}/previous-recalls`
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
