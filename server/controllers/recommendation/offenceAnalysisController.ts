import { NextFunction, Request, Response } from 'express'
import { updateRecommendation } from '../../data/makeDecisionApiClient'
import { nextPageLinkUrl } from '../recommendations/helpers/urls'
import { routeUrls } from '../../routes/routeUrls'
import { validateOffenceAnalysis } from '../recommendations/offenceAnalysis/formValidator'
import { inputDisplayValuesOffenceAnalysis } from '../recommendations/offenceAnalysis/inputDisplayValues'

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
    propertyToRefresh: 'indexOffenceDetails',
  })

  res.locals = {
    ...res.locals,
    recommendation,
    page: {
      id: 'offenceAnalysis',
    },
  }

  res.locals.inputDisplayValues = inputDisplayValuesOffenceAnalysis({
    errors: res.locals.errors,
    unsavedValues: res.locals.unsavedValues,
    apiValues: recommendation,
  })

  res.render(`pages/recommendations/offenceAnalysis`)
  next()
}

async function post(req: Request, res: Response, _: NextFunction) {
  const { recommendationId } = req.params
  const {
    flags,
    user: { token },
    urlInfo,
  } = res.locals

  const { errors, valuesToSave, unsavedValues } = await validateOffenceAnalysis({
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

  const nextPagePath = `${routeUrls.recommendations}/${recommendationId}/task-list#heading-person-details`
  res.redirect(303, nextPageLinkUrl({ nextPagePath, urlInfo }))
}

export default { get, post }
